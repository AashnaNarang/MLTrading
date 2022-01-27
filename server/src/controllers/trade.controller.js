const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { tradeService } = require('../services');

const addTrade = catchAsync(async (req, res) => {
  const trade = await tradeService.addTrade(req.body);
  res.status(httpStatus.CREATED).send(trade);
});

const getTradesByPortfolioId = catchAsync(async (req, res) => {
  const result = await tradeService.getTradesByPortfolioId(req.params.portfolioId);
  res.send(result);
});

const getTrades = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['portfolio']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await tradeService.queryTrades(filter, options);
  res.send(result);
});

module.exports = {
  addTrade, 
  getTradesByPortfolioId,
  getTrades
};