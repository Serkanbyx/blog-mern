import api from "../axios";

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 30000,
  });

  return data.url;
};
