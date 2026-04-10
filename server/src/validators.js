const { body } = require("express-validator");
const slugify = require("slugify");

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

const slugifyTitle = (value) => {
  const slug = slugify(value, { lower: true, strict: true });
  if (!slug) {
    throw new Error("Title must contain at least one letter or number");
  }
  return value;
};

const createPostRules = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage("Title must be between 3 and 150 characters")
    .custom(slugifyTitle)
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
    .custom(slugifyTitle)
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

// ─── Preferences ─────────────────────────────────────────────

const preferencesRules = [
  body("theme")
    .optional()
    .isIn(["light", "dark", "system"])
    .withMessage("Theme must be one of: light, dark, system"),
  body("fontSize")
    .optional()
    .isIn(["small", "medium", "large"])
    .withMessage("Font size must be one of: small, medium, large"),
  body("contentDensity")
    .optional()
    .isIn(["compact", "comfortable", "spacious"])
    .withMessage("Content density must be one of: compact, comfortable, spacious"),
  body("animationsEnabled")
    .optional()
    .isBoolean()
    .withMessage("Animations enabled must be a boolean"),
  body("language")
    .optional()
    .isIn(["en", "tr"])
    .withMessage("Language must be one of: en, tr"),
  body("privacy.showLikedPosts")
    .optional()
    .isBoolean()
    .withMessage("Show liked posts must be a boolean"),
  body("privacy.showComments")
    .optional()
    .isBoolean()
    .withMessage("Show comments must be a boolean"),
  body("privacy.showEmail")
    .optional()
    .isBoolean()
    .withMessage("Show email must be a boolean"),
  body("notifications.postApproved")
    .optional()
    .isBoolean()
    .withMessage("Post approved notification must be a boolean"),
  body("notifications.postRejected")
    .optional()
    .isBoolean()
    .withMessage("Post rejected notification must be a boolean"),
  body("notifications.newCommentOnPost")
    .optional()
    .isBoolean()
    .withMessage("New comment notification must be a boolean"),
  body("postsPerPage")
    .optional()
    .isInt({ min: 5, max: 50 })
    .withMessage("Posts per page must be between 5 and 50"),
  body("defaultSort")
    .optional()
    .isIn(["newest", "popular", "mostCommented"])
    .withMessage("Default sort must be one of: newest, popular, mostCommented"),
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
  preferencesRules,
  guestLikeRules,
};
