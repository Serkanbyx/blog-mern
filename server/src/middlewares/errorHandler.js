const { NODE_ENV } = require("../config/env");

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = null;

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const fieldErrors = Object.values(err.errors).map((e) => e.message);
    message = "Validation failed";
    errors = fieldErrors;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message =
      field === "email" ? "Email is already registered" : `${field} already exists`;
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }

  // Hide internal details in production
  if (NODE_ENV === "production" && statusCode === 500) {
    message = "Internal server error";
    errors = null;
  }

  const response = { success: false, message };
  if (errors) response.errors = errors;

  // Log full error in development
  if (NODE_ENV !== "production") {
    console.error("Error:", err);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
