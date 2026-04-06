const express = require("express");
const { protect, optionalAuth } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { createCommentRules } = require("../validators");
const {
  getComments,
  createComment,
  deleteComment,
  getUserComments,
} = require("../controllers/commentController");

const router = express.Router();

router.get("/posts/:postId/comments", getComments);
router.post("/posts/:postId/comments", protect, createCommentRules, validate, createComment);
router.delete("/comments/:commentId", protect, deleteComment);
router.get("/users/:userId/comments", optionalAuth, getUserComments);

module.exports = router;
