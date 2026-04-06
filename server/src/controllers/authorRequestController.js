const AuthorRequest = require("../models/AuthorRequest");

// @desc    Submit a new author request
// @route   POST /api/author-requests
// @access  Private (user role only)
const submitRequest = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (req.user.role !== "user") {
      return res
        .status(400)
        .json({ success: false, message: "Only users can submit author requests." });
    }

    const existingPending = await AuthorRequest.findOne({
      user: req.user._id,
      status: "pending",
    });

    if (existingPending) {
      return res
        .status(400)
        .json({ success: false, message: "You already have a pending author request." });
    }

    if (req.user.role === "author") {
      return res
        .status(400)
        .json({ success: false, message: "You are already an author." });
    }

    const authorRequest = await AuthorRequest.create({
      user: req.user._id,
      message,
    });

    res.status(201).json({ success: true, data: authorRequest });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's most recent author request
// @route   GET /api/author-requests/mine
// @access  Private
const getMyRequest = async (req, res, next) => {
  try {
    const authorRequest = await AuthorRequest.findOne({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: authorRequest });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel current user's pending author request
// @route   DELETE /api/author-requests/mine
// @access  Private
const cancelRequest = async (req, res, next) => {
  try {
    const authorRequest = await AuthorRequest.findOne({
      user: req.user._id,
      status: "pending",
    });

    if (!authorRequest) {
      return res
        .status(400)
        .json({ success: false, message: "No pending author request found." });
    }

    await authorRequest.deleteOne();

    res.json({ success: true, message: "Author request cancelled successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitRequest, getMyRequest, cancelRequest };
