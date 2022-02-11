const mongoose = require('mongoose');
const { portfolioOne, portfolioTwo, portfolioThree } = require('./portfolio.fixture');
const { securityOne, securityTwo, securityThree, securityFour } = require('./security.fixture');
const { Trade } = require('../../src/models');

const tradeOne = {
    _id: mongoose.Types.ObjectId(),
    portfolio: portfolioOne._id, 
    security: securityOne,
    price: 807.33,
    action: "Purchased",
    sharesTraded: 5,
    profit: 0,
    securityCode: securityOne.securityCode, 
    transactionCost: portfolioOne.transactionCost,
    dateTraded: new Date(new Date().setMonth(new Date().getMonth() - 3))
};

const tradeTwo = {
    _id: mongoose.Types.ObjectId(),
    portfolio: portfolioOne._id, 
    security: securityOne,
    price: 1000.00,
    action: "Sold",
    sharesTraded: 3,
    profit: 578.01,
    securityCode: securityOne.securityCode, 
    transactionCost: portfolioOne.transactionCost,
    dateTraded: new Date()
}

const tradeThree = {
    _id: mongoose.Types.ObjectId(),
    portfolio: portfolioOne._id, 
    security: securityTwo,
    price: 273.30,
    action: "Sold",
    sharesTraded: 2,
    profit: 200,
    securityCode: securityTwo.securityCode, 
    transactionCost: portfolioOne.transactionCost,
    dateTraded: new Date(new Date().setMonth(new Date().getMonth() - 1))
}

const tradeFour = {
    _id: mongoose.Types.ObjectId(),
    portfolio: portfolioTwo._id, 
    security: securityThree,
    price: 3246.76,
    action: "Purchased",
    sharesTraded: 1,
    profit: 0,
    securityCode: securityThree.securityCode, 
    transactionCost: portfolioTwo.transactionCost,
    dateTraded: new Date()
}

const tradeFive = {
    _id: mongoose.Types.ObjectId(),
    portfolio: portfolioThree._id, 
    security: securityFour,
    price: 173.30,
    action: "Purchased",
    sharesTraded: 2,
    profit: 0,
    securityCode: securityFour.securityCode, 
    transactionCost: portfolioThree.transactionCost,
    dateTraded: new Date()
}

const insertTrades = async(trades) => {
    await Trade.insertMany(trades.map((trade) => ({ ... trade})));
}

module.exports = { 
    tradeOne, 
    tradeTwo, 
    tradeThree, 
    tradeFour,
    tradeFive, 
    insertTrades
}