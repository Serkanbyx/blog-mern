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
  return this.likes.length + this.guestLikeCount;
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

module.exports = mongoose.model("Post", postSchema);
