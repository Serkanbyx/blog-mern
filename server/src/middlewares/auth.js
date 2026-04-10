const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config/env");
const { COOKIE_NAME } = require("../utils/cookieToken");

/**
 * Extracts JWT from httpOnly cookie first, then falls back to
 * Authorization: Bearer header for backward compatibility / API clients.
 */
const extractToken = (req) => {
  if (req.cookies?.[COOKIE_NAME]) return req.cookies[COOKIE_NAME];

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.split(" ")[1];

  return null;
};

// Require valid token — blocks unauthenticated requests
const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

// Attach user if token exists, otherwise continue as guest
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    req.user = user || null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

// Restrict to admin role only
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Admin access required." });
  }
  next();
};

// Restrict to author or admin roles
const authorOrAdmin = (req, res, next) => {
  if (req.user.role !== "author" && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Author or admin access required." });
  }
  next();
};

module.exports = { protect, optionalAuth, adminOnly, authorOrAdmin };
