const ApiError = require("./ApiError");
const { User } = require("../models");
const httpStatus = require("http-status");

/**
 * Validates id from user collection
 * @param {ObjectId} userId - The user id
 * @param {string} errorMessage - The relevant error message
 * @throws {ApiError} - if the ID does not exist in the mongoDB database
 * @returns void
 */
const validateUserId = async (userId, errorMessage) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessage);
  }
};

const validateInitialFreeCash = async (initialFreeCash, errorMessage) => {
  if (initialFreeCash < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
  }
};

module.exports = {
    validateUserId,
    validateInitialFreeCash
  };
  