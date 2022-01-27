const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSecurity = {
  body: Joi.object().keys({
    portfolio: Joi.string().required().custom(objectId),
    securityName: Joi.string().required(),
    securityCode: Joi.string().required(),
    avgPrice: Joi.number().required(),
    shares: Joi.number().required(),
  }),
};

const getSecurities = {
  query: Joi.object().keys({
    portfolio: Joi.string().required().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSecurity = {
  params: Joi.object().keys({
    securityId: Joi.string().required().custom(objectId),
  }),
};

const getSecuritiesUsingPortfolioId = {
  params: Joi.object().keys({
    portfolioId: Joi.string().required().custom(objectId),
  }),
};

const updateSecurity = {
  params: Joi.object().keys({
    securityId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      portfolio: Joi.custom(objectId),
      securityName: Joi.string(),
      securityCode: Joi.string(),
      avgPrice: Joi.number(),
      shares: Joi.number(),
    })
    .min(1),
};

const deleteSecurity = {
  params: Joi.object().keys({
    securityId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createSecurity,
  getSecurities,
  getSecurity,
  updateSecurity,
  deleteSecurity,
  getSecuritiesUsingPortfolioId,
};
