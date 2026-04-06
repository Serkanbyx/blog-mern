import api from "../axios";

export const getUserProfile = (userId) => api.get(`/users/${userId}`);

export const getUserLikedPosts = (userId, params) =>
  api.get(`/users/${userId}/liked-posts`, { params });
