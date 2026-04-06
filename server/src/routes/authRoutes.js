const express = require("express");
const { protect } = require("../middlewares/auth");
const {
  registerValidation,
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerValidation, register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.put("/me/password", protect, changePassword);
router.delete("/me", protect, deleteAccount);

module.exports = router;
