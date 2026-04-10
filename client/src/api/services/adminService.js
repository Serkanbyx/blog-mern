import api from "../axios";

// Dashboard
export const getDashboardStats = () => api.get("/admin/dashboard");

// User management
export const getAllUsers = (params) => api.get("/admin/users", { params });

export const getUserById = (id) => api.get(`/admin/users/${id}`);

export const updateUserRole = (id, role) =>
  api.patch(`/admin/users/${id}/role`, { role });

export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// Author request management
export const getPendingAuthorRequests = (params) =>
  api.get("/admin/author-requests", { params });

export const approveAuthorRequest = (id) =>
  api.patch(`/admin/author-requests/${id}/approve`);

export const rejectAuthorRequest = (id, reason) =>
  api.patch(`/admin/author-requests/${id}/reject`, { rejectionReason: reason });

// Post moderation
export const getAllPostsAdmin = (params) =>
  api.get("/admin/posts", { params });

export const getPendingPosts = (params) =>
  api.get("/admin/posts/pending", { params });

export const approvePost = (id) => api.patch(`/admin/posts/${id}/approve`);

export const rejectPost = (id, reason) =>
  api.patch(`/admin/posts/${id}/reject`, { rejectionReason: reason });

export const adminDeletePost = (id) => api.delete(`/admin/posts/${id}`);

// Comment moderation
export const getAllCommentsAdmin = (params) =>
  api.get("/admin/comments", { params });

export const adminDeleteComment = (id) =>
  api.delete(`/admin/comments/${id}`);
