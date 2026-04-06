const express = require("express");
const { protect, optionalAuth, authorOrAdmin } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { createPostRules, updatePostRules } = require("../validators");
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
router.post("/", protect, authorOrAdmin, createPostRules, validate, createPost);
router.put("/:id", protect, authorOrAdmin, updatePostRules, validate, updatePost);
router.patch("/:id/submit", protect, authorOrAdmin, submitPost);
router.delete("/:id", protect, deletePost);

module.exports = router;
