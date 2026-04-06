const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post ID is required"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
