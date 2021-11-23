const faker = require('faker');
const mongoose = require('mongoose');
const { Portfolio } = require('../../../src/models');

describe('Portfolio model', () => {
  describe('User validation', () => {
    let newPortfolio;
    beforeEach(() => {
      newPortfolio = {
        user: mongoose.Types.ObjectId(),
        portfolioType: 'personal',
        currPortfolioValue: 0,
        initialFreeCash: 50,
        freeCash: 50, 
        transactionCost: 1.50,
        currency: "USD"
      };
    });

    test('should correctly validate a valid user', async () => {
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

    test('should throw a validation error if initialFreeCash is a negative value', async () => {
      newPortfolio.transactionCost = -5;
      await expect(new Portfolio(newPortfolio).validate()).rejects.toThrow();
    });
  });
});
