const httpStatus = require('http-status');
const { PortfolioValues } = require('../models');
const { validatePortfolioId } = require("../utils/serviceUtils");
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} portfolioBody
 * @returns {Promise<Value>}
 */
const addPortfolioValue = async (portfolioBody) => {
  await validatePortfolioId(portfolioBody.portfolioId, "Portfolio this ID does not exist");
  portfolioBody.dateAdded = new Date();
  return PortfolioValues.create(portfolioBody);
};

/**
 * Query for portfolios
 * @param {Object} filter - Portfolio Id
 * @returns {Promise<QueryResult>}
 */
const getPortfoliosById = async (portfolioId) => {
  const oneYearAgo = new Date().setFullYear(new Date().getFullYear() - 1);
  const portfolioValues = await PortfolioValues.find({portfolioId: portfolioId, 
    dateAdded: {$gte: oneYearAgo}});
  return portfolioValues;
};

module.exports = {
  addPortfolioValue,
  getPortfoliosById
};
