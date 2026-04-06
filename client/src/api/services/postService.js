import api from "../axios";

export const getAllPosts = (params) => api.get("/posts", { params });

export const getPostBySlug = (slug) => api.get(`/posts/${slug}`);

export const createPost = (postData) => api.post("/posts", postData);

export const updatePost = (id, postData) => api.put(`/posts/${id}`, postData);

export const deletePost = (id) => api.delete(`/posts/${id}`);

export const getMyPosts = (params) => api.get("/posts/mine", { params });

export const submitPost = (id) => api.patch(`/posts/${id}/submit`);
