const mongoose = require('mongoose');
const faker = require('faker');
const Portfolio = require('../../src/models/portfolio.model');
const { userOne, admin } = require('./user.fixture');

const portfolioOne = {
  _id: mongoose.Types.ObjectId(),
  user: userOne._id,
  portfolioType: 'personal',
  currPortfolioValue: 50,
  profit: 0, 
  initialFreeCash: 50,
  freeCash: 50, 
  transactionCost: 1.50,
  currency: "USD"
};

const portfolioTwo = {
  _id: mongoose.Types.ObjectId(),
  user: userOne._id,
  portfolioType: 'tfsa',
  currPortfolioValue: 410,
  profit: 0, 
  initialFreeCash: 500,
  freeCash: 400, 
  transactionCost: 1.50,
  currency: "USD"
};

const portfolioThree = {
  _id: mongoose.Types.ObjectId(),
  user: admin._id,
  portfolioType: 'tfsa',
  currPortfolioValue: 510,
  profit: 500,
  initialFreeCash: 600,
  freeCash: 500, 
  transactionCost: 1.50,
  currency: "USD"
};

const insertPortfolios = async (portfolios) => {
  await Portfolio.insertMany(portfolios.map((portfolio) => ({ ...portfolio })));
};

module.exports = {
  portfolioOne,
  portfolioTwo,
  portfolioThree,
  insertPortfolios,
};
