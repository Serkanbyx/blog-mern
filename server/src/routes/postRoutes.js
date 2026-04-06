const express = require("express");
const { protect, optionalAuth, authorOrAdmin } = require("../middlewares/auth");
const {
  createPost,
  getAllPosts,
  getPostBySlug,
  getMyPosts,
  updatePost,
  submitPost,
  deletePost,
} = require("../controllers/postController");

const router = express.Router();

router.get("/", optionalAuth, getAllPosts);
router.get("/mine", protect, authorOrAdmin, getMyPosts);
router.get("/:slug", optionalAuth, getPostBySlug);
router.post("/", protect, authorOrAdmin, createPost);
router.put("/:id", protect, authorOrAdmin, updatePost);
router.patch("/:id/submit", protect, authorOrAdmin, submitPost);
router.delete("/:id", protect, deletePost);

module.exports = router;
