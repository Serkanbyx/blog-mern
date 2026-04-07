const Post = require("../models/Post");
const escapeRegex = require("../utils/escapeRegex");

/**
 * Validates image URL — only allows internal /uploads/ paths or HTTP(S) URLs.
 * Rejects javascript:, data:, and other dangerous protocol schemes.
 */
const isValidImageUrl = (url) => {
  if (!url || url === "") return true;
  if (url.startsWith("/uploads/")) return true;

  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitizes tags array — trims, limits length, removes empties.
 */
const sanitizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];

  return tags
    .slice(0, 10)
    .map((tag) => String(tag).trim().slice(0, 30))
    .filter(Boolean);
};

// POST /api/posts
const createPost = async (req, res, next) => {
  try {
    const { title, content, image, tags } = req.body;

    if (image && !isValidImageUrl(image)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image URL. Only /uploads/ paths or HTTP(S) URLs are allowed.",
      });
    }

    const postData = {
      title,
      content,
      image: image || "",
      tags: sanitizeTags(tags),
      author: req.user._id,
      status: req.user.role === "admin" ? "published" : "draft",
    };

    const post = await Post.create(postData);
    const populated = await post.populate("author", "name avatar");

    res.status(201).json({ success: true, post: populated });
  } catch (error) {
    next(error);
  }
};

// GET /api/posts (public — published only)
const getAllPosts = async (req, res, next) => {
  try {
    let { page, limit, search, tag, author, sort } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    const filter = { status: "published" };

    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { content: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (tag) {
      filter.tags = tag;
    }

    if (author) {
      filter.author = author;
    }

    let sortOption;
    switch (sort) {
      case "popular":
        sortOption = { guestLikeCount: -1, createdAt: -1 };
        break;
      case "mostCommented":
        sortOption = { commentsCount: -1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const totalPosts = await Post.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limit) || 1;

    let posts = await Post.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "name avatar");

    // For "popular" sort, re-sort in memory using the totalLikes virtual
    if (sort === "popular") {
      posts = posts.sort((a, b) => b.totalLikes - a.totalLikes);
    }

    // Add isLiked flag for authenticated users
    if (req.user) {
      posts = posts.map((post) => {
        const postObj = post.toObject();
        postObj.isLiked = post.likes.some(
          (id) => id.toString() === req.user._id.toString()
        );
        return postObj;
      });
    }

    res.json({ success: true, posts, page, limit, totalPages, totalPosts });
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/:slug (public — published only)
const getPostBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      slug: req.params.slug,
      status: "published",
    }).populate("author", "name avatar bio");

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const postObj = post.toObject();

    if (req.user) {
      postObj.isLiked = post.likes.some(
        (id) => id.toString() === req.user._id.toString()
      );
    }

    res.json({ success: true, post: postObj });
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/mine
const getMyPosts = async (req, res, next) => {
  try {
    let { page, limit, status } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    const filter = { author: req.user._id };

    if (status && ["draft", "pending", "published", "rejected"].includes(status)) {
      filter.status = status;
    }

    const totalPosts = await Post.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limit) || 1;

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("author", "name avatar");

    res.json({ success: true, posts, page, limit, totalPages, totalPosts });
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/mine/:id
const getMyPostById = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user._id,
    }).populate("author", "name avatar");

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// PUT /api/posts/:id
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "You can only edit your own posts." });
    }

    const { title, content, image, tags } = req.body;

    if (image !== undefined && !isValidImageUrl(image)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image URL. Only /uploads/ paths or HTTP(S) URLs are allowed.",
      });
    }

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (image !== undefined) post.image = image;
    if (tags !== undefined) post.tags = sanitizeTags(tags);

    const isAdmin = req.user.role === "admin";

    if (post.status === "published" && !isAdmin) {
      post.status = "draft";
    } else if (post.status === "pending") {
      post.status = "draft";
    } else if (post.status === "rejected") {
      post.status = "draft";
      post.rejectionReason = "";
    }

    await post.save();
    await post.populate("author", "name avatar");

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/posts/:id/submit
const submitPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "You can only submit your own posts." });
    }

    if (post.status === "pending") {
      return res.json({ success: true, post });
    }

    if (post.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft posts can be submitted for review.",
      });
    }

    post.status = "pending";
    post.rejectionReason = "";
    await post.save();

    res.json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "You are not authorized to delete this post." });
    }

    // Lazy-load to avoid issues if Comment/GuestLike models aren't created yet
    let Comment, GuestLike;
    try {
      Comment = require("../models/Comment");
    } catch { /* model not yet created */ }
    try {
      GuestLike = require("../models/GuestLike");
    } catch { /* model not yet created */ }

    const deletionTasks = [post.deleteOne()];
    if (Comment) deletionTasks.push(Comment.deleteMany({ post: post._id }));
    if (GuestLike) deletionTasks.push(GuestLike.deleteMany({ postId: post._id }));

    await Promise.all(deletionTasks);

    res.json({ success: true, message: "Post deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostBySlug,
  getMyPosts,
  getMyPostById,
  updatePost,
  submitPost,
  deletePost,
};
