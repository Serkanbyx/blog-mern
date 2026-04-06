const { body } = require("express-validator");

// ─── Auth ─────────────────────────────────────────────────────

const registerRules = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .escape(),
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginRules = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const changePasswordRules = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

const deleteAccountRules = [
  body("password").notEmpty().withMessage("Password is required to confirm account deletion"),
];

// ─── Posts ────────────────────────────────────────────────────

const createPostRules = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters")
    .escape(),
  body("content")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters"),
];

const updatePostRules = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters")
    .escape(),
  body("content")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters"),
];

// ─── Comments ─────────────────────────────────────────────────

const createCommentRules = [
  body("text")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Comment must be between 1 and 500 characters")
    .escape(),
];

// ─── Author Requests ──────────────────────────────────────────

const authorRequestRules = [
  body("message")
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Message must be between 10 and 500 characters")
    .escape(),
];

// ─── Admin ────────────────────────────────────────────────────

const updateRoleRules = [
  body("role")
    .isIn(["user", "author", "admin"])
    .withMessage("Role must be one of: user, author, admin"),
];

const rejectionRules = [
  body("rejectionReason")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Rejection reason must be between 1 and 500 characters")
    .escape(),
];

// ─── Likes ────────────────────────────────────────────────────

const guestLikeRules = [
  body("fingerprint")
    .trim()
    .isLength({ min: 1, max: 64 })
    .withMessage("Fingerprint must be between 1 and 64 characters"),
];

module.exports = {
  registerRules,
  loginRules,
  changePasswordRules,
  deleteAccountRules,
  createPostRules,
  updatePostRules,
  createCommentRules,
  authorRequestRules,
  updateRoleRules,
  rejectionRules,
  guestLikeRules,
};
