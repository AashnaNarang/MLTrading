const httpStatus = require('http-status');
const { Security } = require('../models');
const { validatePortfolioId } = require("../utils/serviceUtils");
const ApiError = require('../utils/ApiError');
const yahooFinance = require('yahoo-finance2').default;

/**
 * Add a security
 * @param {Object} securityBody
 * @returns {Promise<Security>}
 */
const createSecurity = async (securityBody) => {
  await validatePortfolioId(securityBody.portfolio, "Portfolio with this ID does not exist");
  securityBody.totalValue = securityBody.avgPrice * securityBody.shares;
  securityBody.lastUpdated = new Date();
  return Security.create(securityBody);
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
const querySecurities = async (filter, options) => {
  const securities = await Security.paginate(filter, options);
  
  // Iterate through all the results, add on the extra values we need, and push to a new array
  let results = [];
  for (let i = 0; i < securities.results.length; i++) {
    let security = securities.results[i];
    if (security.shares > 0) {
      const quote = await yahooFinance.quote(security.securityCode);
      let currPrice = quote.regularMarketPrice;
      let currTotalValue = security.shares * currPrice;
      let info = {
        currentPrice: currPrice, 
        currTotalValue: currTotalValue, 
        totalReturn: currTotalValue - security.totalValue,
        security: security
      };
      results.push(info);
    }
  }

  // reconstruct the return value
  let data = {
    page: securities.page, 
    limit: securities.limit, 
    totalPages: securities.totalPages, 
    totalResults: securities.totalResults,
    results: results
  }
  return data;
};

/**
 * Get live security info by id
 * @param {ObjectId} id
 * @returns {Promise<Security>}
 */
const getSecurityInfoById = async (id) => {
  let security = await Security.findById(id);
  if (!security) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Security not found');
  }
  const quote = await yahooFinance.quote(security.securityCode);
  let currPrice = quote.regularMarketPrice;
  let currTotalValue = security.shares * currPrice;

  let data = {
    currentPrice: currPrice, 
    currTotalValue: currTotalValue, 
    totalReturn: currTotalValue - security.totalValue,
    security: security
  };

  return data;
};

/**
 * Get security by id
 * @param {ObjectId} id
 * @returns {Promise<Security>}
 */
const getSecurityById = async (id) => {
  let security = await Security.findById(id);
  return security;
};

/**
 * Update security by id
 * @param {ObjectId} securityId
 * @param {Object} updateBody
 * @returns {Promise<Security>}
 */
const updateSecurityById = async (securityId, updateBody) => {
  const security = await getSecurityById(securityId);
  if (!security) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Security not found');
  }
  if (updateBody.portfolio) {
    await validatePortfolioId(updateBody.portfolio, "Portfolio with this ID does not exist");
  }
  if (updateBody.avgPrice | updateBody.shares) {
    updateBody.totalValue = updateBody.avgPrice * updateBody.shares;
  }
  
  updateBody.lastUpdated = new Date();
  Object.assign(security, updateBody);
  await security.save();
  return security;
};

/**
 * Delete security by id
 * @param {ObjectId} securityId
 * @returns {Promise<Security>}
 */
const deleteSecurityById = async (securityId) => {
  const security = await getSecurityById(securityId);
  if (!security) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Security not found');
  }
  await security.remove();
  return security;
};

module.exports = {
  createSecurity,
  querySecurities,
  getSecurityById,
  getSecurityInfoById,
  updateSecurityById,
  deleteSecurityById,
};
