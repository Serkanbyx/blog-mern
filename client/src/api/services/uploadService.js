import api from "../axios";

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await api.post("/upload", formData, {
    timeout: 30000,
  });

  return data.url;
};
