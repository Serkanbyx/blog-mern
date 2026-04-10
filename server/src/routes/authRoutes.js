const express = require("express");
const { protect } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  registerRules,
  loginRules,
  changePasswordRules,
  deleteAccountRules,
  preferencesRules,
} = require("../validators");
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");
const { updatePreferences } = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.put("/me/password", protect, changePasswordRules, validate, changePassword);
router.delete("/me", protect, deleteAccountRules, validate, deleteAccount);
router.put("/me/preferences", protect, preferencesRules, validate, updatePreferences);

module.exports = router;
