import api from "../axios";

/**
 * Uploads an image and returns both URL and Cloudinary public_id
 * so the backend can delete the asset later.
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await api.post("/upload", formData, {
    timeout: 30000,
  });

  return { url: data.url, publicId: data.publicId };
};
