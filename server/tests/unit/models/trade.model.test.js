const faker = require('faker');
const mongoose = require('mongoose');
const { Trade } = require('../../../src/models');

describe('Trade model', () => {
  describe('Trade validation', () => {
    let newTrade;
    beforeEach(() => {
      newTrade = {
        portfolio: mongoose.Types.ObjectId(),
        action: 'Purchased',
        price: 55.55,
        security: mongoose.Types.ObjectId(),
        sharesTraded: 2, 
        transactionCost: 1.50,
        profit: 0, 
        dateTraded: new Date(),
        securityCode: "SHOP"
      };
    });

    test('should correctly validate a valid trade', async () => {
      await expect(new Trade(newTrade).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if action is invalid', async () => {
      newTrade.action = "haha";
      await expect(new Trade(newTrade).validate()).rejects.toThrow();
    });

    test('should throw a validation error if sharesTraded is a negative value', async () => {
      newTrade.sharesTraded = -5;
      await expect(new Trade(newTrade).validate()).rejects.toThrow();
    });

    test('should throw a validation error if transaction cost is a negative value', async () => {
      newTrade.transactionCost = -5;
      await expect(new Trade(newTrade).validate()).rejects.toThrow();
    });
  });
});
