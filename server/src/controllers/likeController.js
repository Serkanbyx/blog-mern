const Post = require("../models/Post");
const GuestLike = require("../models/GuestLike");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DUPLICATE_KEY_CODE = 11000;

/**
 * Derives guestLikeCount from GuestLike collection (authoritative source),
 * syncs it and totalLikeCount onto the Post document, and returns the canonical totalLikes.
 */
const syncGuestLikeCount = async (postId) => {
  const guestCount = await GuestLike.countDocuments({ postId });

  const post = await Post.findById(postId);
  post.guestLikeCount = guestCount;
  post.totalLikeCount = post.likes.length + guestCount;
  await post.save();

  return {
    totalLikes: post.totalLikeCount,
    post,
  };
};

// POST /api/posts/:id/like — registered users only
const toggleLike = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Atomic toggle — $addToSet is idempotent, $pull is safe on missing values.
    // We try $pull first; if nothing was removed the user hadn't liked yet.
    const pulled = await Post.findOneAndUpdate(
      { _id: req.params.id, status: "published", likes: userId },
      { $pull: { likes: userId } },
      { new: true }
    );

    let updatedPost;
    let isLiked;

    if (pulled) {
      updatedPost = pulled;
      isLiked = false;
    } else {
      updatedPost = await Post.findOneAndUpdate(
        { _id: req.params.id, status: "published" },
        { $addToSet: { likes: userId } },
        { new: true }
      );

      if (!updatedPost) {
        return res.status(404).json({
          success: false,
          message: "Post not found or not published.",
        });
      }

      isLiked = true;
    }

    updatedPost.totalLikeCount =
      updatedPost.likes.length + (updatedPost.guestLikeCount ?? 0);
    await updatedPost.save();

    res.json({
      success: true,
      totalLikes: updatedPost.totalLikeCount,
      isLiked,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/posts/:id/guest-like — anonymous users
const toggleGuestLike = async (req, res, next) => {
  try {
    const { fingerprint } = req.body;

    if (!UUID_REGEX.test(fingerprint)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid fingerprint format." });
    }

    const post = await Post.findOne({
      _id: req.params.id,
      status: "published",
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or not published.",
      });
    }

    // Atomic toggle: try removing first, then create if nothing was removed
    const removed = await GuestLike.findOneAndDelete({
      postId: post._id,
      fingerprint,
    });

    let isLiked;

    if (removed) {
      isLiked = false;
    } else {
      try {
        await GuestLike.create({ postId: post._id, fingerprint });
        isLiked = true;
      } catch (error) {
        // Another concurrent request already created the like — treat as "already liked"
        if (error.code === DUPLICATE_KEY_CODE) {
          isLiked = true;
        } else {
          throw error;
        }
      }
    }

    // Derive count from GuestLike collection (authoritative) and sync to Post
    const { totalLikes } = await syncGuestLikeCount(post._id);

    res.json({ success: true, totalLikes, isLiked });
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/:id/guest-like?fingerprint=xxx
const checkGuestLike = async (req, res, next) => {
  try {
    const { fingerprint } = req.query;

    if (!fingerprint || typeof fingerprint !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Fingerprint query parameter is required." });
    }

    const existingLike = await GuestLike.findOne({
      postId: req.params.id,
      fingerprint,
    });

    res.json({ success: true, isLiked: !!existingLike });
  } catch (error) {
    next(error);
  }
};

module.exports = { toggleLike, toggleGuestLike, checkGuestLike };
