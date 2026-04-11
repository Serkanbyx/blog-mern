import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-remove Content-Type for FormData so the browser sets the correct boundary
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Messages returned by the protect middleware when the token/session is invalid
const TOKEN_FAILURE_MESSAGES = new Set([
  "Access denied. No token provided.",
  "User no longer exists.",
  "Invalid or expired token.",
]);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const serverMessage = error.response.data?.message ?? "";
      const requestUrl = error.config?.url ?? "";

      // Skip redirect for session verification — AuthContext handles this gracefully
      const isSessionCheck = requestUrl.includes("/auth/me") && error.config?.method === "get";

      if (
        TOKEN_FAILURE_MESSAGES.has(serverMessage) &&
        !isSessionCheck &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
