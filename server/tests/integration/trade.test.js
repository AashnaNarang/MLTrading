const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Trade } = require('../../src/models');
const { portfolioOne, portfolioTwo, portfolioThree, insertPortfolios } = require('../fixtures/portfolio.fixture');
const { userOne, userTwo, admin, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const { securityOne, securityTwo, securityThree, securityFour, insertSecurities } = require('../fixtures/security.fixture');
const { tradeOne, tradeTwo, tradeThree, tradeFour, insertTrades, tradeFive } = require('../fixtures/trade.fixture');

setupTestDB();

describe('Trades routes', () => {
  describe('POST /v1/trades', () => {
    let newTrade;

    beforeEach(() => {
      newTrade = {
        portfolio: portfolioOne._id,
        security: securityOne._id, 
        price: 807.33, 
        sharesTraded: 5,
        action: "Purchased"
      };
    });

    test('should return 201 and successfully create a new purchased trade if data is ok', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne]);
      await insertSecurities([securityOne])

      const res = await request(app)
        .post('/v1/trades')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTrade)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        portfolio: portfolioOne._id.toHexString(),  
        securityCode: "SHOP", 
        security: securityOne._id.toHexString(),
        transactionCost: portfolioOne.transactionCost,
        price: 807.33, 
        sharesTraded: 5,
        profit: 0,
        action: "Purchased",
        dateTraded: expect.anything()
      });

      const dbTrade = await Trade.findById(res.body.id);
      expect(dbTrade).toBeDefined();
      expect(dbTrade).toMatchObject({ id: expect.anything(), portfolio: newTrade.portfolio, security: newTrade.security, securityCode: securityOne.securityCode, 
        price: newTrade.price, sharesTraded: newTrade.sharesTraded, action: newTrade.action, profit: 0, dateTraded: expect.anything(), transactionCost: portfolioOne.transactionCost});
    });

    test('should return 201 and successfully create a new sale trade if data is ok', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne]);
      await insertSecurities([securityOne]);
      newTrade.price = 707.33;
      newTrade.sharesTraded = 2;
      newTrade.action = "Sold";

      const res = await request(app)
        .post('/v1/trades')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTrade)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        portfolio: portfolioOne._id.toHexString(),  
        securityCode: "SHOP",
        security: securityOne._id.toHexString(),
        transactionCost: portfolioOne.transactionCost,
        price: 707.33, 
        sharesTraded: 2,
        profit: 200.00,
        action: "Sold",
        dateTraded: expect.anything()
      });

      const dbTrade = await Trade.findById(res.body.id);
      expect(dbTrade).toBeDefined();
      expect(dbTrade).toMatchObject({ id: expect.anything(), portfolio: newTrade.portfolio, security: newTrade.security, securityCode: securityOne.securityCode, 
        price: newTrade.price, sharesTraded: newTrade.sharesTraded, action: newTrade.action, profit: 200, dateTraded: expect.anything(), transactionCost: portfolioOne.transactionCost});
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/trades').send(newTrade).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 error if portfolio does not exist', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/trades')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTrade)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error if security does not exist', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne]);

      await request(app)
        .post('/v1/trades')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTrade)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if security and portfolio do not match, but portfolio belongs to user', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioTwo]);
      newTrade.portfolio = portfolioTwo._id 


      await request(app)
        .post('/v1/trades')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTrade)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if number values are below 0', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne]);
      newTrade.price = -5.0;
      newTrade.sharesTraded = -5.0;
      newTrade.transactionCost = -5.0; 

      await request(app)
        .post('/v1/securities')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newTrade)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/trades', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([admin, userOne, userTwo]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);
      await insertTrades([tradeOne, tradeTwo, tradeThree, tradeFour, tradeFive]);

      const res = await request(app)
        .get(`/v1/trades`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ portfolio: portfolioOne._id.toHexString() })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].portfolio).toEqual(portfolioOne._id.toHexString());
      expect(res.body.results[1].portfolio).toEqual(portfolioOne._id.toHexString());
      expect(res.body.results[2].portfolio).toEqual(portfolioOne._id.toHexString());
    });

    test('should return 401 if access token is missing', async () => {
      await insertUsers([admin, userOne]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour])
      await insertTrades([tradeOne, tradeTwo, tradeThree, tradeFour, tradeFive]);

      await request(app).get('/v1/trades')
        .query({ portfolio: portfolioOne._id.toHexString() })
        .send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if trying to query securities from someone else\'s portfolio', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);
      await insertTrades([tradeOne, tradeTwo, tradeThree, tradeFour, tradeFive]);

      await request(app)
        .get('/v1/trades')
        .query({ portfolio: portfolioOne._id.toHexString() })
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);
      await insertTrades([tradeOne, tradeTwo, tradeThree, tradeFour, tradeFive]);

      const res = await request(app)
        .get('/v1/trades')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ portfolio: portfolioOne._id.toHexString() })
        .query({ sortBy: 'dateTraded:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(tradeTwo._id.toHexString());
      expect(res.body.results[1].id).toBe(tradeThree._id.toHexString());
      expect(res.body.results[2].id).toBe(tradeOne._id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);
      await insertTrades([tradeOne, tradeTwo, tradeThree, tradeFour, tradeFive]);

      const res = await request(app)
        .get('/v1/trades')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ portfolio: portfolioOne._id.toHexString() })
        .query({ sortBy: 'dateTraded:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(3);
      expect(res.body.results[0].id).toBe(tradeOne._id.toHexString());
      expect(res.body.results[1].id).toBe(tradeThree._id.toHexString());
      expect(res.body.results[2].id).toBe(tradeTwo._id.toHexString());
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);
      await insertTrades([tradeOne, tradeTwo, tradeThree, tradeFour, tradeFive]);

      const res = await request(app)
        .get('/v1/trades')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ portfolio: portfolioOne._id.toHexString() })
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 1,
        totalPages: 3,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(tradeOne._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);
      await insertTrades([tradeOne, tradeTwo, tradeThree, tradeFour, tradeFive]);

      const res = await request(app)
        .get('/v1/trades')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ portfolio: portfolioOne._id.toHexString() })
        .query({ limit: 1, page: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 1,
        totalPages: 3,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(tradeTwo._id.toHexString());
    });
  });
});
