import api from "../axios";

export const toggleLike = (postId) => api.post(`/posts/${postId}/like`);

export const toggleGuestLike = (postId, fingerprint) =>
  api.post(`/posts/${postId}/guest-like`, { fingerprint });

export const checkGuestLike = (postId, fingerprint) =>
  api.get(`/posts/${postId}/guest-like`, { params: { fingerprint } });
