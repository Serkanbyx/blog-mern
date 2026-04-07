const express = require("express");
const multer = require("multer");
const { protect } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

router.post("/", protect, (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      const messages = {
        LIMIT_FILE_SIZE: "File size exceeds the 5 MB limit.",
        LIMIT_UNEXPECTED_FILE: "Only JPEG, PNG, and WebP images are allowed.",
        LIMIT_FILE_COUNT: "Only one file can be uploaded at a time.",
      };

      return res.status(400).json({
        success: false,
        message: messages[err.code] || "File upload error.",
      });
    }

    if (err) {
      return res.status(500).json({
        success: false,
        message: "An unexpected error occurred during upload.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided.",
      });
    }

    try {
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      const result = await cloudinary.uploader.upload(base64, {
        folder: "blog",
        resource_type: "image",
      });

      res.status(200).json({
        success: true,
        url: result.secure_url,
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error?.message || error);

      const isConfigError =
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET;

      res.status(500).json({
        success: false,
        message: isConfigError
          ? "Cloud storage is not configured. Please set Cloudinary credentials."
          : "Image upload to cloud failed.",
      });
    }
  });
});

module.exports = router;
