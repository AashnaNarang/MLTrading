const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addPortfolioValue = {
  body: Joi.object().keys({
    portfolioId: Joi.string().required().custom(objectId),
    portfolioValue: Joi.number().required(),
  }),
};

const getPortfolioValues = {
  params: Joi.object().keys({
    portfolioId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  addPortfolioValue,
  getPortfolioValues,
};
