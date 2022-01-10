const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { portfolioService } = require('../services');

const createPortfolio = catchAsync(async (req, res) => {
  const portfolio = await portfolioService.createPortfolio(req.body);
  res.status(httpStatus.CREATED).send(portfolio);
});

const getPortfolios = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['user']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await portfolioService.queryPortfolios(filter, options);
  res.send(result);
});

const getPortfolio = catchAsync(async (req, res) => {
  const portfolio = await portfolioService.getPortfolioById(req.params.portfolioId);
  if (!portfolio) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Portfolio not found');
  }
  res.send(portfolio);
});

const getPortfolioUsingUserId = catchAsync(async (req, res) => {
  const portfolio = await portfolioService.getPortfolioByUserId(req.params.userId);
  if (!portfolio) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Portfolio not found');
  }
  res.send(portfolio);
});

const updatePortfolio = catchAsync(async (req, res) => {
  const portfolio = await portfolioService.updatePortfolioById(req.params.portfolioId, req.body);
  res.send(portfolio);
});

const deletePortfolio = catchAsync(async (req, res) => {
  await portfolioService.deletePortfolioById(req.params.portfolioId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createPortfolio,
  getPortfolios,
  getPortfolio,
  getPortfolioUsingUserId,
  updatePortfolio,
  deletePortfolio,
};