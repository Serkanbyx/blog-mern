const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  toggleLike,
  toggleGuestLike,
  checkGuestLike,
} = require("../controllers/likeController");

// Registered user like toggle (auth required)
router.post("/posts/:id/like", protect, toggleLike);

// Guest like toggle (rate limited via index.js)
router.post("/posts/:id/guest-like", toggleGuestLike);

// Check if guest already liked
router.get("/posts/:id/guest-like", checkGuestLike);

module.exports = router;
