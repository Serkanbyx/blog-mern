const { validationResult } = require("express-validator");

/**
 * Express middleware that checks express-validator results.
 * Must be placed AFTER validation rule arrays in the middleware chain.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};

module.exports = validate;
