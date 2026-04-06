import api from "../axios";

export const getComments = (postId, params) =>
  api.get(`/posts/${postId}/comments`, { params });

export const createComment = (postId, commentData) =>
  api.post(`/posts/${postId}/comments`, commentData);

export const deleteComment = (commentId) =>
  api.delete(`/comments/${commentId}`);

export const getUserComments = (userId, params) =>
  api.get(`/users/${userId}/comments`, { params });
