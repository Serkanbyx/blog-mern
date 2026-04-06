const express = require("express");
const { protect, optionalAuth } = require("../middlewares/auth");
const {
  getComments,
  createComment,
  deleteComment,
  getUserComments,
} = require("../controllers/commentController");

const router = express.Router();

// Post comment routes
router.get("/posts/:postId/comments", getComments);
router.post("/posts/:postId/comments", protect, createComment);

// Standalone comment routes
router.delete("/comments/:commentId", protect, deleteComment);

// User comment routes
router.get("/users/:userId/comments", optionalAuth, getUserComments);

module.exports = router;
