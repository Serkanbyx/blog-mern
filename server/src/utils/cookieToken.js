const { NODE_ENV } = require("../config/env");

const COOKIE_NAME = "jwt";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

/**
 * Sets the JWT token as an httpOnly cookie on the response.
 */
const setTokenCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
};

/**
 * Clears the JWT cookie (used on logout).
 */
const clearTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });
};

module.exports = { COOKIE_NAME, setTokenCookie, clearTokenCookie };
