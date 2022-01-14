const mongoose = require('mongoose');
const faker = require('faker');
const PortfolioValues = require('../../src/models/portfolioValues.model');
const { portfolioOne, portfolioTwo } = require('./portfolio.fixture');

const portfolioValueOne = {
    _id: mongoose.Types.ObjectId(),
    portfolioId: portfolioOne._id,
    portfolioValue: 50,
};

const portfolioValueTwo = {
    _id: mongoose.Types.ObjectId(),
    portfolioId: portfolioOne._id,
    portfolioValue: 50,
};

const portfolioValueThree = {
    _id: mongoose.Types.ObjectId(),
    portfolioId: portfolioTwo._id,
    portfolioValue: 50,
};

const insertPortfolioValues = async (portfolioValues) => {
    await PortfolioValues.insertMany(portfolioValues.map((value) => ({ ...value })));
};

module.exports = {
    portfolioValueOne,
    portfolioValueTwo,
    portfolioValueThree,
    insertPortfolioValues,
  };
  