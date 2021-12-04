const httpStatus = require('http-status');
const { Portfolio } = require('../models');
const { validateUserId, validateInitialFreeCash } = require("../utils/serviceUtils");
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} portfolioBody
 * @returns {Promise<Portfolio>}
 */
const createPortfolio = async (portfolioBody) => {
  await validateUserId(portfolioBody.user, "User with this ID does not exist");
  await validateInitialFreeCash(portfolioBody.initialFreeCash, "Initial Free Cash Value must be valid, positive number.");
  portfolioBody.freeCash = portfolioBody.initialFreeCash
  return Portfolio.create(portfolioBody);
};

/**
 * Query for portfolios
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryPortfolios = async (filter, options) => {
  const portfolios = await Portfolio.paginate(filter, options);
  return portfolios;
};

/**
 * Get portfolio by id
 * @param {ObjectId} id
 * @returns {Promise<Portfolio>}
 */
const getPortfolioById = async (id) => {
  return Portfolio.findById(id);
};

/**
 * Get portfolio by user id
 * @param {ObjectId} userId
 * @returns {Promise<Portfolio>}
 */
const getPortfolioByUserId = async (userId) => {
  return Portfolio.findOne({ user: userId });
};

/**
 * Update portfolio by id
 * @param {ObjectId} portfolioId
 * @param {Object} updateBody
 * @returns {Promise<Portfolio>}
 */
const updatePortfolioById = async (portfolioId, updateBody) => {
  const portfolio = await getPortfolioById(portfolioId);
  if (!portfolio) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Portfolio not found');
  }
  if (updateBody.user) {
    await validateUserId(updateBody.user, "User with this ID does not exist");
  }

  Object.assign(portfolio, updateBody);
  await portfolio.save();
  return portfolio;
};

/**
 * Delete portfolio by id
 * @param {ObjectId} portfolioId
 * @returns {Promise<Portfolio>}
 */
const deletePortfolioById = async (portfolioId) => {
  const portfolio = await getPortfolioById(portfolioId);
  if (!portfolio) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Portfolio not found');
  }
  await portfolio.remove();
  return portfolio;
};

module.exports = {
  createPortfolio,
  queryPortfolios,
  getPortfolioById,
  getPortfolioByUserId,
  updatePortfolioById,
  deletePortfolioById,
};
