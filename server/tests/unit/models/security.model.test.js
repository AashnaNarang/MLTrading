const mongoose = require('mongoose');
const { Security } = require('../../../src/models');

describe('Security model', () => {
  describe('Security validation', () => {
    let newSecurity;
    beforeEach(() => {
      newSecurity = {
        portfolio: mongoose.Types.ObjectId(),
        securityName: 'Shopify',
        securityCode: 'SHOP',
        avgPrice: 2555.55,
        shares: 2, 
        totalValue: 5111.10,
        lastUpdated: new Date()
      };
    });

    test('should correctly validate a valid security', async () => {
      await expect(new Security(newSecurity).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if avgPrice is a negative value', async () => {
      newSecurity.avgPrice = -5;
      await expect(new Security(newSecurity).validate()).rejects.toThrow();
    });

    test('should throw a validation error if shares is a negative value', async () => {
      newSecurity.shares = -5;
      await expect(new Security(newSecurity).validate()).rejects.toThrow();
    });

    test('should throw a validation error if totalValue is a negative value', async () => {
      newSecurity.totalValue = -5;
      await expect(new Security(newSecurity).validate()).rejects.toThrow();
    });
  });
});
