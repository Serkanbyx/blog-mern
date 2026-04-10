const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const AuthorRequest = require("../models/AuthorRequest");
const GuestLike = require("../models/GuestLike");
const escapeRegex = require("../utils/escapeRegex");
const { deleteCloudinaryAsset, deleteCloudinaryAssets } = require("../utils/cloudinaryDelete");

// ─── Dashboard ───────────────────────────────────────────────

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalAuthors,
      totalPosts,
      publishedPosts,
      pendingPosts,
      rejectedPosts,
      totalComments,
      pendingAuthorRequests,
      recentUsers,
      recentPendingPosts,
      recentAuthorRequests,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "author" }),
      Post.countDocuments(),
      Post.countDocuments({ status: "published" }),
      Post.countDocuments({ status: "pending" }),
      Post.countDocuments({ status: "rejected" }),
      Comment.countDocuments(),
      AuthorRequest.countDocuments({ status: "pending" }),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt"),
      Post.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("author", "name")
        .select("title author createdAt"),
      AuthorRequest.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name")
        .select("user message createdAt"),
    ]);

    // Trim long messages to a short preview
    const formattedRequests = recentAuthorRequests.map((r) => ({
      _id: r._id,
      user: r.user,
      messagePreview:
        r.message.length > 60 ? `${r.message.slice(0, 60)}…` : r.message,
      createdAt: r.createdAt,
    }));

    res.json({
      success: true,
      data: {
        totalUsers,
        totalAuthors,
        totalPosts,
        publishedPosts,
        pendingPosts,
        rejectedPosts,
        totalComments,
        pendingAuthorRequests,
        recentUsers,
        recentPendingPosts,
        recentAuthorRequests: formattedRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── User Management ─────────────────────────────────────────

const getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.role && ["user", "author", "admin"].includes(req.query.role)) {
      filter.role = req.query.role;
    }

    if (req.query.search) {
      const safeSearch = escapeRegex(req.query.search);
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("name email avatar role bio createdAt"),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const [publishedPosts, pendingPosts, totalComments, authorRequests] =
      await Promise.all([
        Post.countDocuments({ author: user._id, status: "published" }),
        Post.countDocuments({ author: user._id, status: "pending" }),
        Comment.countDocuments({ user: user._id }),
        AuthorRequest.find({ user: user._id })
          .sort({ createdAt: -1 })
          .select("message status rejectionReason createdAt reviewedAt"),
      ]);

    res.json({
      success: true,
      data: {
        user,
        stats: { publishedPosts, pendingPosts, totalComments },
        authorRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    // Admin cannot change their own role
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Must keep at least one admin in the system
    if (targetUser.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot demote the last admin. Promote another user first.",
        });
      }
    }

    targetUser.role = role;
    await targetUser.save();

    res.json({
      success: true,
      message: `User role updated to '${role}'.`,
      data: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Cannot delete self
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account from admin panel.",
      });
    }

    // Cannot delete another admin — must demote first
    if (targetUser.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete an admin. Demote to user/author first.",
      });
    }

    // Collect user's posts for cascade deletion and Cloudinary cleanup
    const userPosts = await Post.find({ author: targetUser._id }).select("_id imagePublicId");
    const postIds = userPosts.map((p) => p._id);

    // Collect all Cloudinary public IDs to delete (avatar + post images)
    const cloudinaryIds = userPosts
      .map((p) => p.imagePublicId)
      .filter(Boolean);
    if (targetUser.avatarPublicId) cloudinaryIds.push(targetUser.avatarPublicId);

    // Count this user's comments on OTHER people's posts (to fix their commentsCount)
    const affectedPosts = await Comment.aggregate([
      { $match: { user: targetUser._id, postId: { $nin: postIds } } },
      { $group: { _id: "$postId", count: { $sum: 1 } } },
    ]);

    const session = await mongoose.startSession();
    let deletedPosts, deletedComments, deletedGuestLikes, deletedRequests;

    try {
      session.startTransaction();

      // Find posts liked by this user before modifying them
      const likedByUserPostIds = await Post.find(
        { likes: targetUser._id },
        { _id: 1 },
        { session }
      ).then((docs) => docs.map((d) => d._id));

      [deletedPosts, deletedComments, deletedGuestLikes, deletedRequests] =
        await Promise.all([
          Post.deleteMany({ author: targetUser._id }, { session }),
          Comment.deleteMany(
            { $or: [{ user: targetUser._id }, { postId: { $in: postIds } }] },
            { session }
          ),
          GuestLike.deleteMany({ postId: { $in: postIds } }, { session }),
          AuthorRequest.deleteMany({ user: targetUser._id }, { session }),
          likedByUserPostIds.length > 0
            ? Post.updateMany(
                { _id: { $in: likedByUserPostIds } },
                { $pull: { likes: targetUser._id }, $inc: { totalLikeCount: -1 } },
                { session }
              )
            : Promise.resolve(),
        ]);

      // Recalculate commentsCount on other people's posts
      if (affectedPosts.length > 0) {
        await Post.bulkWrite(
          affectedPosts.map(({ _id, count }) => ({
            updateOne: {
              filter: { _id },
              update: { $inc: { commentsCount: -count } },
            },
          })),
          { session }
        );
      }

      await User.findByIdAndDelete(targetUser._id, { session });

      await session.commitTransaction();
    } catch (txError) {
      await session.abortTransaction();
      throw txError;
    } finally {
      session.endSession();
    }

    // Delete Cloudinary assets after successful DB transaction
    if (cloudinaryIds.length > 0) {
      await deleteCloudinaryAssets(cloudinaryIds);
    }

    res.json({
      success: true,
      message: "User and all related data deleted.",
      data: {
        deletedPosts: deletedPosts.deletedCount,
        deletedComments: deletedComments.deletedCount,
        deletedGuestLikes: deletedGuestLikes.deletedCount,
        deletedAuthorRequests: deletedRequests.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Author Request Management ───────────────────────────────

const getPendingAuthorRequests = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { status: "pending" };

    const [requests, totalRequests] = await Promise.all([
      AuthorRequest.find(filter)
        .sort({ createdAt: 1 }) // FIFO — oldest first
        .skip(skip)
        .limit(limit)
        .populate("user", "name email avatar bio createdAt"),
      AuthorRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        requests,
        page,
        limit,
        totalPages: Math.ceil(totalRequests / limit),
        totalRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

const approveAuthorRequest = async (req, res, next) => {
  try {
    const request = await AuthorRequest.findById(req.params.id);

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Author request not found." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${request.status}.`,
      });
    }

    request.status = "approved";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Promote user to author role
    await User.findByIdAndUpdate(request.user, { role: "author" });

    const populatedRequest = await AuthorRequest.findById(request._id)
      .populate("user", "name email avatar")
      .populate("reviewedBy", "name");

    res.json({
      success: true,
      message: "Author request approved. User is now an author.",
      data: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

const rejectAuthorRequest = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    const request = await AuthorRequest.findById(req.params.id);

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Author request not found." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${request.status}.`,
      });
    }

    request.status = "rejected";
    request.rejectionReason = rejectionReason;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    const populatedRequest = await AuthorRequest.findById(request._id)
      .populate("user", "name email avatar")
      .populate("reviewedBy", "name");

    res.json({
      success: true,
      message: "Author request rejected.",
      data: populatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Post Moderation ─────────────────────────────────────────

const getPendingPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { status: "pending" };

    const [posts, totalPosts] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: 1 }) // FIFO — oldest first
        .skip(skip)
        .limit(limit)
        .populate("author", "name email avatar"),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        posts,
        page,
        limit,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllPostsAdmin = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (
      req.query.status &&
      ["draft", "pending", "published", "rejected"].includes(req.query.status)
    ) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const safeSearch = escapeRegex(req.query.search);
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { tags: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (req.query.author) {
      filter.author = req.query.author;
    }

    const [posts, totalPosts] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name email avatar"),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        posts,
        page,
        limit,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
      },
    });
  } catch (error) {
    next(error);
  }
};

const approvePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    if (post.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Only pending posts can be approved. Current status: '${post.status}'.`,
      });
    }

    post.status = "published";
    post.rejectionReason = "";
    await post.save();

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "name email avatar"
    );

    res.json({
      success: true,
      message: "Post approved and published.",
      data: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

const rejectPost = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    if (post.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Only pending posts can be rejected. Current status: '${post.status}'.`,
      });
    }

    post.status = "rejected";
    post.rejectionReason = rejectionReason;
    await post.save();

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "name email avatar"
    );

    res.json({
      success: true,
      message: "Post rejected.",
      data: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

const adminDeletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const oldPublicId = post.imagePublicId;

    const [deletedComments, deletedGuestLikes] = await Promise.all([
      Comment.deleteMany({ postId: post._id }),
      GuestLike.deleteMany({ postId: post._id }),
    ]);

    await Post.findByIdAndDelete(post._id);

    if (oldPublicId) {
      await deleteCloudinaryAsset(oldPublicId);
    }

    res.json({
      success: true,
      message: "Post and all related data deleted.",
      data: {
        deletedComments: deletedComments.deletedCount,
        deletedGuestLikes: deletedGuestLikes.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Comment Moderation ──────────────────────────────────────

const getAllCommentsAdmin = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
      const safeSearch = escapeRegex(req.query.search);
      const regex = { $regex: safeSearch, $options: "i" };

      const [matchingUsers, matchingPosts] = await Promise.all([
        User.find({ name: regex }).select("_id"),
        Post.find({ title: regex }).select("_id"),
      ]);

      filter.$or = [
        { text: regex },
        { user: { $in: matchingUsers.map((u) => u._id) } },
        { postId: { $in: matchingPosts.map((p) => p._id) } },
      ];
    }

    const [comments, totalComments] = await Promise.all([
      Comment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email avatar")
        .populate("postId", "title slug"),
      Comment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        comments,
        page,
        limit,
        totalPages: Math.ceil(totalComments / limit),
        totalComments,
      },
    });
  } catch (error) {
    next(error);
  }
};

const adminDeleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found." });
    }

    await Promise.all([
      Comment.findByIdAndDelete(comment._id),
      Post.findByIdAndUpdate(comment.postId, {
        $inc: { commentsCount: -1 },
      }),
    ]);

    res.json({
      success: true,
      message: "Comment deleted.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getPendingAuthorRequests,
  approveAuthorRequest,
  rejectAuthorRequest,
  getPendingPosts,
  getAllPostsAdmin,
  approvePost,
  rejectPost,
  adminDeletePost,
  getAllCommentsAdmin,
  adminDeleteComment,
};
