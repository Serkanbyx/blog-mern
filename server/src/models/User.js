const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "author", "admin"],
      default: "user",
    },
    bio: {
      type: String,
      maxlength: [200, "Bio cannot exceed 200 characters"],
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      fontSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      contentDensity: {
        type: String,
        enum: ["compact", "comfortable", "spacious"],
        default: "comfortable",
      },
      animationsEnabled: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        enum: ["en", "tr"],
        default: "en",
      },
      privacy: {
        showLikedPosts: { type: Boolean, default: true },
        showComments: { type: Boolean, default: true },
        showEmail: { type: Boolean, default: false },
      },
      notifications: {
        postApproved: { type: Boolean, default: true },
        postRejected: { type: Boolean, default: true },
        newCommentOnPost: { type: Boolean, default: true },
      },
      postsPerPage: {
        type: Number,
        default: 10,
        min: [5, "Posts per page minimum is 5"],
        max: [50, "Posts per page maximum is 50"],
      },
      defaultSort: {
        type: String,
        enum: ["newest", "popular", "mostCommented"],
        default: "newest",
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving (only if modified)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare candidate password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
