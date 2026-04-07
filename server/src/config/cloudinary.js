const { v2: cloudinary } = require("cloudinary");
const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = require("./env");

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn(
    "Cloudinary credentials missing —",
    `cloud_name: ${CLOUDINARY_CLOUD_NAME ? "OK" : "MISSING"},`,
    `api_key: ${CLOUDINARY_API_KEY ? "OK" : "MISSING"},`,
    `api_secret: ${CLOUDINARY_API_SECRET ? "OK" : "MISSING"}`
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
