const mongoose = require("mongoose");

const guestLikeSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post ID is required"],
    },
    fingerprint: {
      type: String,
      required: [true, "Fingerprint is required"],
      maxlength: [64, "Fingerprint cannot exceed 64 characters"],
    },
  },
  { timestamps: true }
);

// Prevent duplicate guest likes per post
guestLikeSchema.index({ postId: 1, fingerprint: 1 }, { unique: true });

// Fast counting by postId
guestLikeSchema.index({ postId: 1 });

module.exports = mongoose.model("GuestLike", guestLikeSchema);
