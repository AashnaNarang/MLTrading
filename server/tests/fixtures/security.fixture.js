const mongoose = require('mongoose');
const { portfolioOne, portfolioTwo, portfolioThree } = require('./portfolio.fixture');
const { Security } = require('../../src/models');

const securityOne = {
    _id: mongoose.Types.ObjectId(),
    portfolio: portfolioOne._id, 
    securityName: "Shopify", 
    securityCode: "SHOP", 
    avgPrice: 807.33, 
    shares: 5,
    totalValue: 4036.65,
    lastUpdated: new Date()
};

const securityTwo = {
    _id: mongoose.Types.ObjectId(),
    portfolio: portfolioOne._id, 
    securityName: "Apple", 
    securityCode: "AAPL", 
    avgPrice: 173.30, 
    shares: 2,
    totalValue: 346.6,
    lastUpdated: new Date(new Date().setMonth(new Date().getMonth() - 1))
}

const securityThree = {
    _id: mongoose.Types.ObjectId(),
    portfolio: portfolioTwo._id, 
    securityName: "Amazon.com", 
    securityCode: "AMZN", 
    avgPrice: 3246.76, 
    shares: 1,
    totalValue: 3246.76,
    lastUpdated: new Date()
}

const securityFour = {
    _id: mongoose.Types.ObjectId(),
    portfolio: portfolioThree._id, 
    securityName: "Apple Inc", 
    securityCode: "AAPL", 
    avgPrice: 173.30, 
    shares: 2,
    totalValue: 346.6,
    lastUpdated: new Date()
}

const insertSecurities = async(securities) => {
    await Security.insertMany(securities.map((security) => ({ ... security})));
}

module.exports = { 
    securityOne, 
    securityTwo, 
    securityThree, 
    securityFour, 
    insertSecurities
}