const { Trade } = require('../models');
const { portfolioService } = require('../services');
const securityService = require('./security.service');
const { validatePortfolioId, validateSecurityId, validateSecurityAndPortfolioMatch } = require("../utils/serviceUtils");

/**
 * Create a trade
 * @param {Object} tradeBody
 * @returns {Promise<Value>}
 */
const addTrade = async (tradeBody) => {
  await validatePortfolioId(tradeBody.portfolio, "Portfolio with this ID does not exist");
  await validateSecurityId(tradeBody.security, "Security with this ID does not exist");
  await validateSecurityAndPortfolioMatch(tradeBody.security, tradeBody.portfolio, "This security does not belong to the given portfolio")
  let portfolio = await portfolioService.getPortfolioById(tradeBody.portfolio);
  let security = await securityService.getSecurityById(tradeBody.security);
  tradeBody.securityCode = security.securityCode;
  tradeBody.transactionCost = portfolio.transactionCost;

  if (tradeBody.action == "Sold") {
    tradeBody.profit = (security.avgPrice - tradeBody.price) * tradeBody.sharesTraded;
  } else {
    tradeBody.profit = 0.00;
  }
  tradeBody.dateTraded = new Date();
  return Trade.create(tradeBody);
};

/**
 * Query for securities
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
 const queryTrades = async (filter, options) => {
  const trades = await Trade.paginate(filter, options);
  return trades;
};


module.exports = {
  addTrade,
  queryTrades
};
