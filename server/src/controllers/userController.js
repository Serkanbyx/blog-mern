const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

// Allowed preference fields with their validation rules
const PREFERENCE_VALIDATORS = {
  theme: (v) => ["light", "dark", "system"].includes(v),
  fontSize: (v) => ["small", "medium", "large"].includes(v),
  contentDensity: (v) => ["compact", "comfortable", "spacious"].includes(v),
  animationsEnabled: (v) => typeof v === "boolean",
  language: (v) => ["en", "tr"].includes(v),
  "privacy.showLikedPosts": (v) => typeof v === "boolean",
  "privacy.showComments": (v) => typeof v === "boolean",
  "privacy.showEmail": (v) => typeof v === "boolean",
  "notifications.postApproved": (v) => typeof v === "boolean",
  "notifications.postRejected": (v) => typeof v === "boolean",
  "notifications.newCommentOnPost": (v) => typeof v === "boolean",
  postsPerPage: (v) => Number.isInteger(v) && v >= 5 && v <= 50,
  defaultSort: (v) => ["newest", "popular", "mostCommented"].includes(v),
};

// GET /api/users/:userId — Public profile
const getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId).select(
      "name avatar bio role createdAt preferences.privacy"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userObj = user.toObject();

    // Only expose email if the user opted in
    if (user.preferences?.privacy?.showEmail) {
      const fullUser = await User.findById(userId).select("email");
      userObj.email = fullUser.email;
    }

    const postCount = await Post.countDocuments({
      author: userId,
      status: "published",
    });

    const isOwner = req.user && req.user._id.toString() === userId;
    const showComments = user.preferences?.privacy?.showComments !== false;

    let commentCount = null;
    if (showComments || isOwner) {
      commentCount = await Comment.countDocuments({ user: userId });
    }

    res.json({ success: true, user: userObj, postCount, commentCount });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:userId/liked-posts — Public (respects privacy)
const getUserLikedPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const targetUser = await User.findById(userId).select(
      "preferences.privacy.showLikedPosts"
    );

    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isOwner = req.user && req.user._id.toString() === userId;

    if (!targetUser.preferences?.privacy?.showLikedPosts && !isOwner) {
      return res
        .status(403)
        .json({ success: false, message: "This user's liked posts are private." });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { likes: userId, status: "published" };

    const [posts, totalPosts] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name avatar"),
      Post.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalPosts / limit);

    res.json({ success: true, posts, page, totalPages, totalPosts });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/me/preferences — Auth required
const updatePreferences = async (req, res, next) => {
  try {
    const updates = {};

    for (const [field, validate] of Object.entries(PREFERENCE_VALIDATORS)) {
      // Support both flat ("privacy.showEmail") and nested ({ privacy: { showEmail } }) input
      const value = getNestedValue(req.body, field);

      if (value === undefined) continue;

      if (!validate(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid value for preferences.${field}`,
        });
      }

      updates[`preferences.${field}`] = value;
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid preference fields provided" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ success: true, preferences: user.preferences });
  } catch (error) {
    next(error);
  }
};

// Resolve dot-notation paths supporting both flat keys ("privacy.showEmail": false)
// and nested objects ({ privacy: { showEmail: false } })
const getNestedValue = (obj, path) => {
  if (obj == null || typeof obj !== "object") return undefined;

  if (Object.prototype.hasOwnProperty.call(obj, path)) {
    return obj[path];
  }

  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[key];
  }

  return current;
};

module.exports = { getUserProfile, getUserLikedPosts, updatePreferences };
