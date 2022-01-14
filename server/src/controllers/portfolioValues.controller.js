const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { portfolioValuesService } = require('../services');

const addPortfolioValue = catchAsync(async (req, res) => {
  const portfolioValue = await portfolioValuesService.addPortfolioValue(req.body);
  res.status(httpStatus.CREATED).send(portfolioValue);
});

const getPortfolioValues = catchAsync(async (req, res) => {
  const result = await portfolioValuesService.getPortfoliosById(req.params.portfolioId);
  res.send(result);
});

module.exports = {
  addPortfolioValue, 
  getPortfolioValues
};