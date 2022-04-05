const httpStatus = require('http-status');
const { PortfolioValues, Portfolio } = require('../models');
const { validatePortfolioId } = require("../utils/serviceUtils");
const { portfolioService } = require('../services');
const ApiError = require('../utils/ApiError');
const { Security } = require('../models');
const yahooFinance = require('yahoo-finance2').default;

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
        let portfolioValue = portfolio.freeCash;
        let valueOfSecurities = 0;
        let securities = await Security.find({portfolio: portfolio._id});

        for (let i = 0; i < securities.length; i++) {
          let security = securities[i];
          const quote = await yahooFinance.quote(security.securityCode);
          let currPrice = quote.regularMarketPrice;
          valueOfSecurities += security.shares * currPrice;
        }
        portfolioValue += valueOfSecurities;

        await addPortfolioValue({
            portfolioId: portfolio.id, 
            portfolioValue: portfolioValue
        });
        await portfolioService.updatePortfolioById(portfolio.id, {
          currPortfolioValue: portfolioValue.toFixed(2), 
          profit: (portfolioValue - portfolio.initialFreeCash).toFixed(2)
        });
    })
  });
}

module.exports = {
  addPortfolioValue,
  getPortfoliosById,
  addPortfolioValuesJob
};
