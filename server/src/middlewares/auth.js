const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const { portfolioService } = require('../services')

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    console.log(hasRequiredRights);
    if (!hasRequiredRights) {
      let belongsToThem;
      if (req.params.portfolioId) {
        console.log(req.params);
        portfolio = await portfolioService.getPortfolioById(req.params.portfolioId);
        belongsToThem = portfolio ? (portfolio.user == user.id) : false;
        console.log(belongsToThem);
      } else {
        console.log(req.params);
        belongsToThem = (req.params.userId == user.id) || (req.body.user == user.id) ;
        console.log(belongsToThem);
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
