import api from "../axios";

export const submitAuthorRequest = (requestData) =>
  api.post("/author-requests", requestData);

export const getMyAuthorRequest = () => api.get("/author-requests/mine");

export const cancelAuthorRequest = () => api.delete("/author-requests/mine");
