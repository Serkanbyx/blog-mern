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

module.exports = router;
