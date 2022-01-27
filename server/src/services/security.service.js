const httpStatus = require('http-status');
const { Security } = require('../models');
const { validatePortfolioId } = require("../utils/serviceUtils");
const ApiError = require('../utils/ApiError');

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
  return securities;
};

/**
 * Get security by id
 * @param {ObjectId} id
 * @returns {Promise<Security>}
 */
const getSecurityById = async (id) => {
  return Security.findById(id);
};

// /**
//  * Get portfolio by user id
//  * @param {ObjectId} portfolioId
//  * @returns {Promise<Security>}
//  */
// const getSecuritiesByPortfolioId = async (portfolioId) => {
//   return Portfolio.find({ portfolio: portfolioId });
// };

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
  updateSecurityById,
  deleteSecurityById,
};
