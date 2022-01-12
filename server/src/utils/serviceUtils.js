const ApiError = require("./ApiError");
const { User, Portfolio } = require("../models");
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

/**
 * Validates if initial free cash is a positive number
 * @param {Number} initialFreeCash - Initial free cash
 * @param {string} errorMessage - The relevant error message
 * @throws {ApiError} - if the ID does not exist in the mongoDB database
 * @returns void
 */
const validateInitialFreeCash = async (initialFreeCash, errorMessage) => {
  if (initialFreeCash < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
  }
};

/**
 * Validates id from portfolio collection
 * @param {ObjectId} userId - The portfolio id
 * @param {string} errorMessage - The relevant error message
 * @throws {ApiError} - if the ID does not exist in the mongoDB database
 * @returns void
 */
 const validatePortfolioId = async (portfolioId, errorMessage) => {
  const portfolio = await Portfolio.findById(portfolioId);
  if (!portfolio) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessage);
  }
};

module.exports = {
    validateUserId,
    validateInitialFreeCash,
    validatePortfolioId
  };
  