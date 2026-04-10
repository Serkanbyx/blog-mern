const mongoose = require("mongoose");
const slugify = require("slugify");
const crypto = require("crypto");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [10, "Content must be at least 10 characters"],
    },
    image: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "draft",
    },
    rejectionReason: {
      type: String,
      default: "",
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    guestLikeCount: {
      type: Number,
      default: 0,
    },
    totalLikeCount: {
      type: Number,
      default: 0,
      index: true,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual("totalLikes").get(function () {
  return this.totalLikeCount ?? (this.likes?.length ?? 0) + (this.guestLikeCount ?? 0);
});

postSchema.pre("save", function () {
  if (!this.isModified("title")) return;

  const baseSlug = slugify(this.title, { lower: true, strict: true });
  this._baseSlug = baseSlug || crypto.randomBytes(4).toString("hex");
  this.slug = this._baseSlug;
});

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ status: 1 });
postSchema.index({ likes: 1 });
postSchema.index({ totalLikeCount: -1, createdAt: -1 });

const MAX_SLUG_RETRIES = 5;

/**
 * Saves a document, retrying with a random hex suffix on E11000 duplicate-key
 * errors for the slug field. Avoids the race condition of read-before-write.
 */
postSchema.statics.saveWithSlugRetry = async function (doc) {
  for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
    try {
      return await doc.save();
    } catch (err) {
      const isDuplicateSlug =
        err.code === 11000 && err.keyPattern && err.keyPattern.slug;
      if (!isDuplicateSlug || attempt === MAX_SLUG_RETRIES - 1) throw err;

      doc.slug = `${doc._baseSlug}-${crypto.randomBytes(3).toString("hex")}`;
    }
  }
};

/**
 * Atomically recalculates and persists totalLikeCount from likes array length + guestLikeCount.
 * Returns the updated document.
 */
postSchema.statics.syncTotalLikeCount = async function (postId) {
  const post = await this.findById(postId);
  if (!post) return null;

  const computed = post.likes.length + (post.guestLikeCount ?? 0);
  post.totalLikeCount = computed;
  await post.save();
  return post;
};

module.exports = mongoose.model("Post", postSchema);
