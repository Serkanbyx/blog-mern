const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require("../models/User");

// @desc    Get comments for a published post
// @route   GET /api/posts/:postId/comments
// @access  Public
const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findOne({ _id: postId, status: "published" });
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [comments, totalComments] = await Promise.all([
      Comment.find({ postId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name avatar"),
      Comment.countDocuments({ postId }),
    ]);

    res.json({
      success: true,
      comments,
      page,
      totalPages: Math.ceil(totalComments / limit) || 1,
      totalComments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a comment on a published post
// @route   POST /api/posts/:postId/comments
// @access  Private
const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    const post = await Post.findOne({ _id: postId, status: "published" });
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const comment = await Comment.create({
      postId,
      user: req.user._id,
      text,
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    await comment.populate("user", "name avatar");

    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment (owner or admin)
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found." });
    }

    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to delete this comment." });
    }

    await comment.deleteOne();
    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });

    res.json({ success: true, message: "Comment deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments by a specific user
// @route   GET /api/users/:userId/comments
// @access  Public (respects privacy settings)
const getUserComments = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const isSelf = req.user && req.user._id.toString() === userId;
    if (!isSelf && !targetUser.preferences?.privacy?.showComments) {
      return res
        .status(403)
        .json({ success: false, message: "This user's comments are private." });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [comments, totalComments] = await Promise.all([
      Comment.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "postId",
          select: "title slug status",
          match: { status: "published" },
        })
        .populate("user", "name avatar"),
      Comment.countDocuments({ user: userId }),
    ]);

    // Filter out comments whose post was not published (populate match returns null)
    const filteredComments = comments.filter((c) => c.postId !== null);

    res.json({
      success: true,
      comments: filteredComments,
      page,
      totalPages: Math.ceil(totalComments / limit) || 1,
      totalComments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComments, createComment, deleteComment, getUserComments };
