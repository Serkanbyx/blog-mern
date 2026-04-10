const cloudinary = require("../config/cloudinary");

/**
 * Deletes a single Cloudinary asset by its public_id.
 * Silently catches errors to avoid blocking the main operation.
 */
const deleteCloudinaryAsset = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Cloudinary delete failed for "${publicId}":`, error?.message || error);
  }
};

/**
 * Deletes multiple Cloudinary assets in parallel.
 * Filters out falsy values before making requests.
 */
const deleteCloudinaryAssets = async (publicIds) => {
  const validIds = publicIds.filter(Boolean);
  if (validIds.length === 0) return;

  await Promise.allSettled(validIds.map((id) => deleteCloudinaryAsset(id)));
};

module.exports = { deleteCloudinaryAsset, deleteCloudinaryAssets };
