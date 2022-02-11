const ApiError = require("./ApiError");
const { User, Portfolio, Security } = require("../models");
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
 * @param {ObjectId} portfolioId - The portfolio id
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

/**
 * Validates id from security collection
 * @param {ObjectId} securityId - The security id
 * @param {string} errorMessage - The relevant error message
 * @throws {ApiError} - if the ID does not exist in the mongoDB database
 * @returns void
 */
 const validateSecurityId = async (securityId, errorMessage) => {
  const security = await Security.findById(securityId);
  if (!security) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessage);
  }
};

/**
 * Validates security's portfolio and given portfolio match
 * @param {ObjectId} securityId - The security id
 * @param {ObjectId} portfolioId - The portfolio id
 * @param {string} errorMessage - The relevant error message
 * @throws {ApiError} - if the given portoflio id doesnt match the portoflio id of the given security
 * @returns void
 */
 const validateSecurityAndPortfolioMatch = async (securityId, portfolioId, errorMessage) => {
  const security = await Security.findById(securityId);
  if (security.portfolio != portfolioId) {
    throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
  }
};

module.exports = {
    validateUserId,
    validateInitialFreeCash,
    validatePortfolioId, 
    validateSecurityId,
    validateSecurityAndPortfolioMatch
  };
  