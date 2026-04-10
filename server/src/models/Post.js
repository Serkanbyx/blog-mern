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

postSchema.pre("save", async function () {
  if (!this.isModified("title")) return;

  let baseSlug = slugify(this.title, { lower: true, strict: true });

  const existing = await mongoose.model("Post").findOne({ slug: baseSlug, _id: { $ne: this._id } });

  this.slug = existing
    ? `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`
    : baseSlug;
});

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ status: 1 });
postSchema.index({ likes: 1 });
postSchema.index({ totalLikeCount: -1, createdAt: -1 });

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
