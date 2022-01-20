const faker = require('faker');
const mongoose = require('mongoose');
const { Portfolio } = require('../../../src/models');

describe('Portfolio model', () => {
  describe('Portfolio validation', () => {
    let newPortfolio;
    beforeEach(() => {
      newPortfolio = {
        user: mongoose.Types.ObjectId(),
        portfolioType: 'personal',
        currPortfolioValue: 0,
        initialFreeCash: 50,
        freeCash: 50, 
        transactionCost: 1.50,
        profit: 0, 
        currency: "USD"
      };
    });

    test('should correctly validate a valid portfolio', async () => {
      await expect(new Portfolio(newPortfolio).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if initialFreeCash is a negative value', async () => {
      newPortfolio.initialFreeCash = -5;
      await expect(new Portfolio(newPortfolio).validate()).rejects.toThrow();
    });

    test('should throw a validation error if freeCash is a negative value', async () => {
      newPortfolio.freeCash = -5;
      await expect(new Portfolio(newPortfolio).validate()).rejects.toThrow();
    });

    test('should throw a validation error if transactionCost is a negative value', async () => {
      newPortfolio.transactionCost = -5;
      await expect(new Portfolio(newPortfolio).validate()).rejects.toThrow();
    });
  });
});
