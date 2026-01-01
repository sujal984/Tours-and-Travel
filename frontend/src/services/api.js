import axios from "axios";
import Cookies from "js-cookie";
import { endpoints } from "../constant/ENDPOINTS";

const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 2,
  retryDelay: 2000,
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: baseURL || "http://127.0.0.1:8000/api/v1",
  headers: API_CONFIG.defaultHeaders,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // Try to get token from cookies first, then localStorage
    const cookieToken = Cookies.get("authToken");
    const storedToken = localStorage.getItem("authToken");

    const token = cookieToken || storedToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't add Authorization header if no token (for anonymous requests)
    
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// Refresh handling queue
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // If unauthorized, clear auth and redirect
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Clear all auth data
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      Cookies.remove("authToken");
      Cookies.remove("user");
      Cookies.remove("userRole");
      
      // Only redirect if not already on login page or public pages
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/tours', '/destinations', '/hotels', '/vehicles', '/offers', '/contact', '/about'];
      const isPublicPath = publicPaths.some(path => currentPath === path || (path !== '/' && currentPath.startsWith(path)));
      const isLoginPath = currentPath.includes('login');
      
      if (!isLoginPath && !isPublicPath) {
        // Check if we're in admin area or customer area
        if (currentPath.startsWith('/admin')) {
          // Admin area - redirect to admin login
          window.location.href = "/admin/login";
        } else {
          // Customer area - redirect to home page
          window.location.href = "/";
        }
      }
      
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);



const apiClient = {
  get: (url, params = {}, config = {}) => {
    return api.get(url, {
      params,
      ...config,
    });
  },

  post: (url, data = {}, config = {}) => {
    return api.post(url, data, config);
  },

  put: (url, data = {}, config = {}) => {
    return api.put(url, data, config);
  },

  patch: (url, data = {}, config = {}) => {
    return api.patch(url, data, config);
  },

  delete: (url, config = {}) => {
    return api.delete(url, config);
  },
  upload: async (url, formData, options = {}) => {
    console.log("API Upload - URL:", url);
    try {
      const response = await axios.post(url, formData, {
        onUploadProgress: options.onUploadProgress,
        ...options,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  download: (url, filename, config = {}) => {
    return api
      .get(url, {
        responseType: "blob",
        ...config,
      })
      .then((blob) => {
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      });
  },

  endpoint: (baseEndpoint) => ({
    get: (id = "", params = {}, config = {}) =>
      apiClient.get(`${baseEndpoint}${id ? `/${id}` : ""}`, params, config),

    post: (data = {}, config = {}) =>
      apiClient.post(baseEndpoint, data, config),

    put: (id, data = {}, config = {}) =>
      apiClient.put(`${baseEndpoint}/${id}`, data, config),

    patch: (id, data = {}, config = {}) =>
      apiClient.patch(`${baseEndpoint}/${id}`, data, config),

    delete: (id, config = {}) =>
      apiClient.delete(`${baseEndpoint}/${id}`, config),
  }),

  // Batch requests
  batch: (requests) => {
    return Promise.allSettled(
      requests.map((req) =>
        apiClient[req.method](req.url, req.data, req.config)
      )
    );
  },

  cancelToken: () => axios.CancelToken.source(),

  // Check if error is a cancel error
  isCancel: (error) => axios.isCancel(error),
};

export const reportsApi = axios.create({
  baseURL: baseURL || "http://localhost:1/api",
  timeout: 45000, //
  headers: API_CONFIG.defaultHeaders,
});

export const createApiEndpoint = (endpoint) => apiClient.endpoint(endpoint);

export const createCustomApiClient = (baseURL, customConfig = {}) => {
  return axios.create({
    baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.defaultHeaders,
    ...customConfig,
  });
};

export { apiClient };
export default apiClient;
