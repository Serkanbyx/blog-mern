const express = require("express");
const { protect, adminOnly } = require("../middlewares/auth");
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getPendingAuthorRequests,
  approveAuthorRequest,
  rejectAuthorRequest,
  getPendingPosts,
  getAllPostsAdmin,
  approvePost,
  rejectPost,
  adminDeletePost,
  getAllCommentsAdmin,
  adminDeleteComment,
} = require("../controllers/adminController");

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Dashboard
router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Author request management
router.get("/author-requests", getPendingAuthorRequests);
router.patch("/author-requests/:id/approve", approveAuthorRequest);
router.patch("/author-requests/:id/reject", rejectAuthorRequest);

// Post moderation
router.get("/posts", getAllPostsAdmin);
router.get("/posts/pending", getPendingPosts);
router.patch("/posts/:id/approve", approvePost);
router.patch("/posts/:id/reject", rejectPost);
router.delete("/posts/:id", adminDeletePost);

// Comment moderation
router.get("/comments", getAllCommentsAdmin);
router.delete("/comments/:id", adminDeleteComment);

module.exports = router;
