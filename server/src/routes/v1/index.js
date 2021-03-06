const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const portfolioRoute = require('./portfolio.route');
const portfolioValuesRoute = require('./portfolioValues.route');
const tradeRoute = require('./trade.route');
const securityRoute = require('./security.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/portfolios',
    route: portfolioRoute,
  },
  {
    path: '/values',
    route: portfolioValuesRoute,
  },
  {
    path: '/trades',
    route: tradeRoute,
  },
  {
    path: '/securities',
    route: securityRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
