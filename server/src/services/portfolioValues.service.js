const httpStatus = require('http-status');
const { PortfolioValues, Portfolio } = require('../models');
const { validatePortfolioId } = require("../utils/serviceUtils");
const { portfolioService } = require('../services');
const ApiError = require('../utils/ApiError');

/**
 * Create a portfolio value
 * @param {Object} portfolioBody
 * @returns {Promise<Value>}
 */
const addPortfolioValue = async (portfolioBody) => {
  await validatePortfolioId(portfolioBody.portfolioId, "Portfolio this ID does not exist");
  portfolioBody.dateAdded = new Date();
  return PortfolioValues.create(portfolioBody);
};

/**
 * Query for portfolio values
 * @param {Object} filter - Portfolio Id
 * @returns {Promise<QueryResult>}
 */
const getPortfoliosById = async (portfolioId) => {
  const oneYearAgo = new Date().setFullYear(new Date().getFullYear() - 1);
  const portfolioValues = await PortfolioValues.find({portfolioId: portfolioId, 
    dateAdded: {$gte: oneYearAgo}});
  return portfolioValues;
};

/**
 * Job to iterate over portfolios, calculate portfolio values and save to db
 */
const addPortfolioValuesJob = async () => {
  Portfolio.find({} , (err, portfolios) => {
    if (err) {
        console.log(err);
        throw new Error("Failed to get portfolios in addPortfolioValuesJob");
    }
    portfolios.map(async (portfolio) => {
        var portfolioValue;
        portfolioValue = portfolio.freeCash;
        // go through securities model filter by portfolio.id
        // calc value of securities and add 
        // note: can remove all asyncs and awaits and itll work still
        await addPortfolioValue({
            portfolioId: portfolio.id, 
            portfolioValue: portfolioValue
        });
        await portfolioService.updatePortfolioById(portfolio.id, {
          currPortfolioValue: portfolioValue, 
          profit: (portfolioValue - portfolio.initialFreeCash)
        });
    })
  });
}

module.exports = {
  addPortfolioValue,
  getPortfoliosById,
  addPortfolioValuesJob
};
