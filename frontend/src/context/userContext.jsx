import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";

import { apiClient } from "../services/api";
import Cookies from 'js-cookie'
import { endpoints } from "../constant/ENDPOINTS";
import { getAnonymousInquiryTokens, clearAnonymousInquiryTokens } from "../utils/inquiryUtils";
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const storedToken = Cookies.get("authToken") || localStorage.getItem("authToken");
      const storedUser = Cookies.get("user") || localStorage.getItem("user");
      const storedRole = Cookies.get("userRole") || localStorage.getItem("userRole");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setRole(storedRole);
          setIsAuthenticated(true);

          // Validate token with /me endpoint
          try {
            const meResp = await apiClient.get(endpoints.GET_USER);
            const currentUserData = meResp.data?.data;
            if (currentUserData) {
              setUser(currentUserData);
              setRole(currentUserData.role);
              // Update stored data with fresh data
              Cookies.set("user", JSON.stringify(currentUserData), { expires: 7 });
              Cookies.set("userRole", currentUserData.role, { expires: 7 });
              localStorage.setItem("user", JSON.stringify(currentUserData));
              localStorage.setItem("userRole", currentUserData.role);
            }
          } catch (error) {
            console.warn("Token validation failed, clearing auth:", error);
            // Clear invalid auth data
            setUser(null);
            setToken(null);
            setRole(null);
            setIsAuthenticated(false);
            Cookies.remove("authToken");
            Cookies.remove("user");
            Cookies.remove("userRole");
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            localStorage.removeItem("userRole");
          }

          console.log("Auth initialized from stored data:", userData);
        } catch (error) {
          console.warn("Failed to parse stored user data:", error);
          // Clear corrupted auth data
          setUser(null);
          setToken(null);
          setRole(null);
          setIsAuthenticated(false);
          Cookies.remove("authToken");
          Cookies.remove("user");
          Cookies.remove("userRole");
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          localStorage.removeItem("userRole");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Associate anonymous inquiries with logged-in user
  const associateAnonymousInquiries = async () => {
    try {
      const tokens = getAnonymousInquiryTokens();
      if (tokens.length === 0) return;

      console.log("Attempting to associate inquiries with tokens:", tokens);

      const response = await apiClient.post(endpoints.ASSOCIATE_ANONYMOUS_INQUIRIES, {
        anonymous_tokens: tokens
      });

      if (response.data?.data?.associated_count > 0) {
        clearAnonymousInquiryTokens();
        message.success(`${response.data.data.associated_count} inquiry(ies) have been associated with your account!`);
        console.log("Successfully associated inquiries:", response.data.data);
      } else {
        console.log("No inquiries were associated:", response.data);
      }
    } catch (error) {
      console.error("Error associating anonymous inquiries:", error);
      // Don't show error message to user as this is a background operation
    }
  };

  // Login function
  const login = async (email, password, userType = "user") => {
    setLoading(true);
    try {
      const response = await apiClient.post(endpoints.LOGIN, {
        email,
        password,
      });

      const data = response?.data;
      const authToken = data?.data?.access_token;

      if (!authToken) throw new Error("No access token received");

      // Save token to both cookies and localStorage for redundancy
      setToken(authToken);
      Cookies.set("authToken", authToken, { expires: 7 }); // 7 days
      localStorage.setItem("authToken", authToken);

      setIsAuthenticated(true);

      // Fetch user data from API
      try {
        const meResp = await apiClient.get(endpoints.GET_USER);
        const userData = meResp.data?.data;
        if (userData) {
          setUser(userData);
          setRole(userData.role || userType);
          // Store user data in both cookies and localStorage
          Cookies.set("user", JSON.stringify(userData), { expires: 7 });
          Cookies.set("userRole", userData.role || userType, { expires: 7 });
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("userRole", userData.role || userType);

          // Associate anonymous inquiries after successful login
          setTimeout(() => {
            associateAnonymousInquiries();
          }, 1000);
        }
      } catch (err) {
        console.warn("Failed to fetch user data:", err);
        // Use data from login response as fallback
        const fallbackUser = data?.data?.user;
        if (fallbackUser) {
          setUser(fallbackUser);
          setRole(fallbackUser.role || userType);
          Cookies.set("user", JSON.stringify(fallbackUser), { expires: 7 });
          Cookies.set("userRole", fallbackUser.role || userType, { expires: 7 });
          localStorage.setItem("user", JSON.stringify(fallbackUser));
          localStorage.setItem("userRole", fallbackUser.role || userType);

          // Associate anonymous inquiries
          setTimeout(() => {
            associateAnonymousInquiries();
          }, 1000);
        }
      }

      message.success("Login successful!");
      return { success: true, data };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Login failed";
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Admin-specific login wrapper
  const adminLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post(endpoints.ADMIN_LOGIN, {
        email,
        password,
      });

      const data = response?.data;
      const authToken = data?.data?.access_token;

      if (!authToken) throw new Error("No access token received");

      // Save token to both cookies and localStorage
      setToken(authToken);
      Cookies.set("authToken", authToken, { expires: 7 });
      localStorage.setItem("authToken", authToken);

      setIsAuthenticated(true);

      // Fetch user data from API
      try {
        const meResp = await apiClient.get(endpoints.GET_USER);
        const userData = meResp.data?.data;
        if (userData) {
          // Verify admin role
          if (userData.role !== 'ADMIN') {
            await logout();
            return { success: false, error: "Access denied. Admin privileges required." };
          }

          setUser(userData);
          setRole(userData.role);
          Cookies.set("user", JSON.stringify(userData), { expires: 7 });
          Cookies.set("userRole", userData.role, { expires: 7 });
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("userRole", userData.role);
        }
      } catch (err) {
        console.warn("Failed to fetch user data:", err);
        // Use data from login response as fallback
        const fallbackUser = data?.data?.user;
        if (fallbackUser && fallbackUser.role === 'ADMIN') {
          setUser(fallbackUser);
          setRole(fallbackUser.role);
          Cookies.set("user", JSON.stringify(fallbackUser), { expires: 7 });
          Cookies.set("userRole", fallbackUser.role, { expires: 7 });
          localStorage.setItem("user", JSON.stringify(fallbackUser));
          localStorage.setItem("userRole", fallbackUser.role);
        } else {
          await logout();
          return { success: false, error: "Access denied. Admin privileges required." };
        }
      }

      message.success("Admin login successful!");
      return { success: true, data };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Admin login failed";
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint (optional since JWT is stateless)
      await apiClient.post(endpoints.LOGOUT);
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear context
      setUser(null);
      setToken(null);
      setRole(null);
      setIsAuthenticated(false);

      // Clear both cookies and localStorage
      Cookies.remove("authToken");
      Cookies.remove("user");
      Cookies.remove("userRole");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");

      message.success("Logged out successfully");
    }
  };

  // Register function
  const register = async (registerData) => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        endpoints.USER_REGISTER,
        registerData
      );

      // After successful registration, automatically log the user in
      const loginResult = await login(registerData.email, registerData.password);
      
      if (loginResult.success) {
        message.success("Registration successful! Welcome!");
        return { success: true, data: response.data };
      } else {
        message.success("Registration successful! Please login.");
        return { success: true, data: response.data };
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Registration failed";
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updatedUserData) => {
    setLoading(true);
    try {
      const response = await apiClient.patch(endpoints.UPDATE_PROFILE, updatedUserData);
      const userData = response.data?.data || response.data;
      setUser(userData);

      // Update persistent storage
      Cookies.set("user", JSON.stringify(userData), { expires: 7 });
      localStorage.setItem("user", JSON.stringify(userData));

      message.success("Profile updated successfully");
      return { success: true, data: userData };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Update failed";
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Get current user info
  const getCurrentUser = async () => {
    if (!token) return false;

    try {
      const response = await apiClient.get(endpoints.GET_USER);
      const userData = response.data;
      setUser(userData);
      Cookies.set("user", JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error("Get user error:", error);
      await logout();
      return false;
    }
  };

  const value = {
    user,
    setUser,
    token,
    setToken,
    role,
    setRole,
    loading,
    isAuthenticated,
    login,
    adminLogin,
    logout,
    register,
    updateProfile,
    getCurrentUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};
