import api from "../axios";

export const registerUser = (userData) => api.post("/auth/register", userData);

export const loginUser = (credentials) => api.post("/auth/login", credentials);

export const logoutUser = () => api.post("/auth/logout");

export const getMe = () => api.get("/auth/me");

export const updateProfile = (profileData) =>
  api.put("/auth/me", profileData);

export const changePassword = (passwordData) =>
  api.put("/auth/me/password", passwordData);

export const deleteAccount = (data) =>
  api.delete("/auth/me", { data });

export const updatePreferences = (preferences) =>
  api.put("/auth/me/preferences", preferences);
