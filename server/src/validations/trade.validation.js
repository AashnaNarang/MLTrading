const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addTrade = {
  body: Joi.object().keys({
    portfolio: Joi.string().required().custom(objectId),
    price: Joi.number().required(),
    action: Joi.string().required().valid("Purchased", "Sold"),
    security: Joi.string().required().custom(objectId),
    sharesTraded: Joi.number().required(), 
  }),
};

const getTrades = {
  query: Joi.object().keys({
    portfolio: Joi.string().required().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTrades2 = {
  params: Joi.object().keys({
    portfolioId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  addTrade,
  getTrades,
  getTrades2
};
