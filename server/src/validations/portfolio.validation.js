const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPortfolio = {
  body: Joi.object().keys({
    user: Joi.string().required().custom(objectId),
    portfolioType: Joi.string().valid("personal", "tfsa", "rrsp"),
    initialFreeCash: Joi.number().required(),
    transactionCost: Joi.number(),
    currency: Joi.string().valid("USD")
  }),
};

const getPortfolios = {
  query: Joi.object().keys({
    user: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPortfolio = {
  params: Joi.object().keys({
    portfolioId: Joi.string().required().custom(objectId),
  }),
};

const updatePortfolio = {
  params: Joi.object().keys({
    portfolioId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      portfolioType: Joi.string().valid("personal", "tfsa", "rrsp"),
      currPortfolioValue: Joi.number(),
      initialFreeCash: Joi.number(),
      freeCash: Joi.number(),
      transactionCost: Joi.number(),
    })
    .min(1),
};

const deletePortfolio = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createPortfolio,
  getPortfolios,
  getPortfolio,
  updatePortfolio,
  deletePortfolio,
};