const Post = require("../models/Post");
const GuestLike = require("../models/GuestLike");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// POST /api/posts/:id/like — registered users only
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    if (post.status !== "published") {
      return res
        .status(403)
        .json({ success: false, message: "Only published posts can be liked." });
    }

    const userId = req.user._id;
    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    let updatedPost;

    if (alreadyLiked) {
      updatedPost = await Post.findByIdAndUpdate(
        post._id,
        { $pull: { likes: userId } },
        { new: true }
      );
    } else {
      updatedPost = await Post.findByIdAndUpdate(
        post._id,
        { $addToSet: { likes: userId } },
        { new: true }
      );
    }

    res.json({
      success: true,
      totalLikes: updatedPost.likes.length + updatedPost.guestLikeCount,
      isLiked: !alreadyLiked,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/posts/:id/guest-like — anonymous users
const toggleGuestLike = async (req, res, next) => {
  try {
    const { fingerprint } = req.body;

    if (!fingerprint || typeof fingerprint !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Fingerprint is required." });
    }

    if (fingerprint.length > 64 || !UUID_REGEX.test(fingerprint)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid fingerprint format." });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    if (post.status !== "published") {
      return res
        .status(403)
        .json({ success: false, message: "Only published posts can be liked." });
    }

    const existingLike = await GuestLike.findOne({
      postId: post._id,
      fingerprint,
    });

    let updatedPost;
    let isLiked;

    if (existingLike) {
      await existingLike.deleteOne();
      updatedPost = await Post.findByIdAndUpdate(
        post._id,
        { $inc: { guestLikeCount: -1 } },
        { new: true }
      );
      isLiked = false;
    } else {
      await GuestLike.create({ postId: post._id, fingerprint });
      updatedPost = await Post.findByIdAndUpdate(
        post._id,
        { $inc: { guestLikeCount: 1 } },
        { new: true }
      );
      isLiked = true;
    }

    res.json({
      success: true,
      totalLikes: updatedPost.likes.length + updatedPost.guestLikeCount,
      isLiked,
    });
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
