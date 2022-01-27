const { Trade } = require('../models');
const { portfolioService } = require('../services');
const securityService = require('./security.service');
const { validatePortfolioId, validateSecurityId } = require("../utils/serviceUtils");

/**
 * Create a trade
 * @param {Object} tradeBody
 * @returns {Promise<Value>}
 */
const addTrade = async (tradeBody) => {
  await validatePortfolioId(tradeBody.portfolio, "Portfolio with this ID does not exist");
  await validateSecurityId(tradeBody.security, "Security with this ID does not exist");
  let portfolio = await portfolioService.getPortfolioById(tradeBody.portfolio);
  tradeBody.transactionCost = portfolio.transactionCost;

  if (tradeBody.action == "Sold") {
    let security = await securityService.getSecurityById(tradeBody.security);
    tradeBody.profit = tradeBody.price - security.avgPrice;
  } else {
    tradeBody.profit = 0.00;
  }
  tradeBody.dateTraded = new Date();
  return Trade.create(tradeBody);
};

/**
 * Query for trades
 * @param {Object} filter - Portfolio Id
 * @returns {Promise<QueryResult>}
 */
const getTradesByPortfolioId = async (portfolioId) => {
  const trades = await Trade.find({portfolioId: portfolioId});
  await trades.forEach(async (trade) =>  {
    let security = await securityService.getSecurityById(tradeBody.securityId);
    trade.securityCode = security.securityCode;
  });
  return trades;
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
  getTradesByPortfolioId,
  queryTrades
};
