import { message } from "antd";

// Global API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Enhanced fetch wrapper with authentication and error handling
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // Default headers
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    // Merge headers
    const headers = {
      ...defaultHeaders,
      ...options.headers,
    };

    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    // Parse response
    const data = await response.json();

    // Handle authentication errors
    if (response.status === 401) {
      handleAuthError(data);
      throw new Error(data.message || "Authentication failed");
    }

    // Handle other errors
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return { data, response };
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

/**
 * Handle authentication errors globally
 */
const handleAuthError = (errorData) => {
  const { code, message: errorMessage } = errorData;

  switch (code) {
    case "TOKEN_EXPIRED":
      message.error("Your session has expired. Please login again.");
      break;
    case "INVALID_TOKEN":
    case "NO_TOKEN":
      message.error("Invalid authentication. Please login again.");
      break;
    case "USER_NOT_FOUND":
    case "USER_INACTIVE":
      message.error("Your account is no longer valid. Please contact support.");
      break;
    default:
      message.error(errorMessage || "Authentication failed");
  }

  // Clear user data and redirect to login
  clearUserDataAndRedirect();
};

/**
 * Clear user data from localStorage and redirect to login
 */
const clearUserDataAndRedirect = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");

  // Redirect to login page
  window.location.href = "/admin/login";
};

/**
 * API methods for common HTTP verbs
 */
export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: "GET" }),

  post: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
};

/**
 * Hook for handling API calls with loading states
 */
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
};
