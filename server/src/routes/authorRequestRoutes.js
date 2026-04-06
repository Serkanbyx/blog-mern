const express = require("express");
const { protect } = require("../middlewares/auth");
const {
  submitRequest,
  getMyRequest,
  cancelRequest,
} = require("../controllers/authorRequestController");

const router = express.Router();

router.post("/author-requests", protect, submitRequest);
router.get("/author-requests/mine", protect, getMyRequest);
router.delete("/author-requests/mine", protect, cancelRequest);

module.exports = router;
