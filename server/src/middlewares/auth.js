const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const { portfolioService, securityService } = require('../services');
const mongoose = require('mongoose');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights) {
      let belongsToThem;
      const portfolioId = req.params.portfolioId || req.query.portfolio || req.body.portfolio;
      if (portfolioId) {
        if (mongoose.Types.ObjectId.isValid(portfolioId)) {
          portfolio = await portfolioService.getPortfolioById(portfolioId);
          belongsToThem = portfolio ? (portfolio.user == user.id) : false;
        } else {
          return reject(new ApiError(httpStatus.BAD_REQUEST, 'Invalid mongo id'));
        }
      } else if (req.params.securityId) {
        if (mongoose.Types.ObjectId.isValid(req.params.securityId)) {
          security = await securityService.getSecurityById(req.params.securityId);
          if (!security) {
            return reject(new ApiError(httpStatus.NOT_FOUND, 'Security not found'));
          } else {
            portfolio = await portfolioService.getPortfolioById(security.portfolio);
            belongsToThem = portfolio ? (portfolio.user == user.id) : false;
          }
        } else {
          return reject(new ApiError(httpStatus.BAD_REQUEST, 'Invalid mongo id'));
        }
      } else {
        belongsToThem = (req.params.userId == user.id) || (req.body.user == user.id);
      }

      if (!belongsToThem) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    }
  }

  resolve();
};

const auth = (...requiredRights) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;
