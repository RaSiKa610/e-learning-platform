const mongoose = require("mongoose");

/**
 * Validates that a string is a valid MongoDB ObjectId.
 * Returns a 400 response if the id is invalid.
 */
exports.validateObjectId = (paramName) => (req, res, next) => {
  const id = req.params[paramName] || req.query[paramName] || req.body[paramName];
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: `Invalid ${paramName}` });
  }
  next();
};
