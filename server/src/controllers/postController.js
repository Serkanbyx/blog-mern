const Post = require("../models/Post");
const sanitizeHtml = require("sanitize-html");
const escapeRegex = require("../utils/escapeRegex");
const { deleteCloudinaryAsset } = require("../utils/cloudinaryDelete");

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

/**
 * Strips all HTML tags from post content (plain-text only field).
 * Defense-in-depth against stored XSS even if client-side rendering is safe.
 */
const sanitizeContent = (rawContent) => {
  if (!rawContent) return rawContent;
  return sanitizeHtml(rawContent, { allowedTags: [], allowedAttributes: {} });
};

// POST /api/posts
const createPost = async (req, res, next) => {
  try {
    const { title, content, image, tags, submit } = req.body;

    if (image && !isValidImageUrl(image)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image URL. Only /uploads/ paths or HTTP(S) URLs are allowed.",
      });
    }

    const isAdmin = req.user.role === "admin";
    let status = "draft";
    if (isAdmin) status = "published";
    else if (submit) status = "pending";

    const { imagePublicId } = req.body;

    const postData = {
      title,
      content: sanitizeContent(content),
      image: image || "",
      imagePublicId: imagePublicId || "",
      tags: sanitizeTags(tags),
      author: req.user._id,
      status,
    };

    const post = new Post(postData);
    await Post.saveWithSlugRetry(post);
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
        sortOption = { totalLikeCount: -1, createdAt: -1 };
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

    const { title, content, image, imagePublicId, tags, submit } = req.body;

    if (image !== undefined && !isValidImageUrl(image)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image URL. Only /uploads/ paths or HTTP(S) URLs are allowed.",
      });
    }

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = sanitizeContent(content);

    // Delete old Cloudinary image when replaced or removed
    if (image !== undefined && image !== post.image && post.imagePublicId) {
      await deleteCloudinaryAsset(post.imagePublicId);
    }
    if (image !== undefined) post.image = image;
    if (imagePublicId !== undefined) post.imagePublicId = imagePublicId || "";

    if (tags !== undefined) post.tags = sanitizeTags(tags);

    const isAdmin = req.user.role === "admin";

    if (isAdmin) {
      // Admin edits keep current status (published stays published)
    } else if (submit) {
      post.status = "pending";
      post.rejectionReason = "";
    } else if (post.status === "published") {
      post.status = "draft";
    } else if (post.status === "pending") {
      post.status = "draft";
    } else if (post.status === "rejected") {
      post.status = "draft";
      post.rejectionReason = "";
    }

    await Post.saveWithSlugRetry(post);
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

    const Comment = require("../models/Comment");
    const GuestLike = require("../models/GuestLike");

    const oldPublicId = post.imagePublicId;

    await Promise.all([
      post.deleteOne(),
      Comment.deleteMany({ postId: post._id }),
      GuestLike.deleteMany({ postId: post._id }),
    ]);

    if (oldPublicId) {
      await deleteCloudinaryAsset(oldPublicId);
    }

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
