const express = require("express");
const { optionalAuth } = require("../middlewares/auth");
const {
  getUserProfile,
  getUserLikedPosts,
} = require("../controllers/userController");

const router = express.Router();

router.get("/:userId", optionalAuth, getUserProfile);
router.get("/:userId/liked-posts", optionalAuth, getUserLikedPosts);

module.exports = router;
