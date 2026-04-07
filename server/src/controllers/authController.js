const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Format user payload for API response (never expose password)
const formatUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio || "",
  role: user.role,
  preferences: user.preferences,
});

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email is already registered" });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ success: true, user: formatUserResponse(user), token });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({ success: true, user: formatUserResponse(user), token });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: formatUserResponse(req.user) });
};

// PUT /api/auth/me
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name", "bio", "avatar"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user: formatUserResponse(user) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/me/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/auth/me
const deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Password is incorrect" });
    }

    // Prevent last admin from self-deleting
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(403).json({
          success: false,
          message: "Cannot delete the last admin account",
        });
      }
    }

    // Lazy-load models to avoid circular dependency issues at startup
    const Post = require("../models/Post");
    const Comment = require("../models/Comment");
    const AuthorRequest = require("../models/AuthorRequest");

    await Promise.all([
      Post.deleteMany({ author: user._id }),
      Comment.deleteMany({ author: user._id }),
      Post.updateMany({}, { $pull: { likes: user._id } }),
      AuthorRequest.deleteMany({ user: user._id }),
      user.deleteOne(),
    ]);

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
};
