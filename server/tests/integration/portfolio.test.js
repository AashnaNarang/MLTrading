const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Portfolio } = require('../../src/models');
const { portfolioOne, portfolioTwo, portfolioThree, insertPortfolios } = require('../fixtures/portfolio.fixture');
const { userOne, userTwo, admin, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Portfolio routes', () => {
  describe('POST /v1/portfolios', () => {
    let newPortfolio;

    beforeEach(() => {
      newPortfolio = {
        user: userOne._id,
        portfolioType: 'personal',
        initialFreeCash: 50,
        transactionCost: 1.50,
        profit: 0, 
      };
    });

    test('should return 201 and successfully create new portfolio if data is ok', async () => {
      await insertUsers([admin, userOne]);

      const res = await request(app)
        .post('/v1/portfolios')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newPortfolio)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        user: userOne._id.toHexString(),
        portfolioType: 'personal',
        initialFreeCash: 50,
        freeCash: 50,
        currPortfolioValue: 50,
        transactionCost: 1.50,
        profit: 0,
        currency: "USD"
      });

      const dbPortfolio = await Portfolio.findById(res.body.id);
      expect(dbPortfolio).toBeDefined();
      expect(dbPortfolio).toMatchObject({ id: expect.anything(), user: newPortfolio.user, portfolioType: newPortfolio.portfolioType, initialFreeCash: newPortfolio.initialFreeCash, 
        transactionCost: newPortfolio.transactionCost, currency: "USD", freeCash: newPortfolio.initialFreeCash});
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/portfolios').send(newPortfolio).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if logged in user is adding a portfolio to another account', async () => {
      await insertUsers([userOne, userTwo]);

      await request(app)
        .post('/v1/portfolios')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(newPortfolio)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 201 if user is adding a portfolio to their own user account', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/v1/portfolios')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newPortfolio)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        // currPortfolioValue is null so it does not appear in the response
        id: expect.anything(),
        user: userOne._id.toHexString(),
        portfolioType: 'personal',
        initialFreeCash: 50,
        freeCash: 50, 
        transactionCost: 1.50,
        currPortfolioValue: 50,
        currency: "USD",
        profit: 0
      });

      const dbPortfolio = await Portfolio.findById(res.body.id);
      expect(dbPortfolio).toBeDefined();
      expect(dbPortfolio).toMatchObject({ id: expect.anything(), user: newPortfolio.user, portfolioType: newPortfolio.portfolioType, initialFreeCash: newPortfolio.initialFreeCash, 
        transactionCost: newPortfolio.transactionCost, currency: "USD", freeCash: newPortfolio.initialFreeCash});
    });

    test('should return 404 error if user does not exist', async () => {
      await insertUsers([admin]);

      await request(app)
        .post('/v1/portfolios')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newPortfolio)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if initial free cash is a negative number', async () => {
      await insertUsers([admin, userOne]);
      newPortfolio.initialFreeCash = -5.0;

      await request(app)
        .post('/v1/portfolios')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(newPortfolio)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/portfolios', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([admin, userOne]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      const res = await request(app)
        .get('/v1/portfolios')
        .set('Authorization', `Bearer ${adminAccessToken}`)
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
      expect(res.body.results[0]).toEqual({
        id: portfolioOne._id.toHexString(),
        user: userOne._id.toHexString(),
        portfolioType: 'personal',
        currPortfolioValue: 50,
        initialFreeCash: 50,
        freeCash: 50, 
        transactionCost: 1.50,
        currency: "USD",
        profit: 0
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertUsers([admin, userOne]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      await request(app).get('/v1/portfolios').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all users', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      await request(app)
        .get('/v1/portfolios')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should correctly apply filter on user field', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      const res = await request(app)
        .get('/v1/portfolios')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ user: userOne._id.toHexString() })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(portfolioOne._id.toHexString());
      expect(res.body.results[1].id).toBe(portfolioTwo._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      const res = await request(app)
        .get('/v1/portfolios')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'user:desc' })
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
      expect(res.body.results[0].id).toBe(portfolioThree._id.toHexString());
      expect(res.body.results[1].id).toBe(portfolioOne._id.toHexString());
      expect(res.body.results[2].id).toBe(portfolioTwo._id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      const res = await request(app)
        .get('/v1/portfolios')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ sortBy: 'user:asc' })
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
      expect(res.body.results[0].id).toBe(portfolioOne._id.toHexString());
      expect(res.body.results[1].id).toBe(portfolioTwo._id.toHexString());
      expect(res.body.results[2].id).toBe(portfolioThree._id.toHexString());
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      const res = await request(app)
        .get('/v1/portfolios')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(portfolioOne._id.toHexString());
      expect(res.body.results[1].id).toBe(portfolioTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      const res = await request(app)
        .get('/v1/portfolios')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .query({ page: 2, limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(portfolioThree._id.toHexString());
    });
  });

  describe('GET /v1/portfolios/:portfolioId', () => {
    test('should return 200 if user is trying to get their own portfolio and the portfolio object if data is ok', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      const res = await request(app)
        .get(`/v1/portfolios/${portfolioOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: portfolioOne._id.toHexString(),
        user: userOne._id.toHexString(),
        portfolioType: 'personal',
        currPortfolioValue: 50,
        initialFreeCash: 50,
        freeCash: 50, 
        transactionCost: 1.50,
        profit: 0,
        currency: "USD"
      });
    });

    test('should return 200 if admin is trying to get their own portfolio and the portfolio object if data is ok', async () => {
      await insertUsers([userOne, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      const res = await request(app)
        .get(`/v1/portfolios/${portfolioThree._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: portfolioThree._id.toHexString(),
        user: admin._id.toHexString(),
        portfolioType: 'tfsa',
        currPortfolioValue: 510,
        initialFreeCash: 600,
        freeCash: 500, 
        transactionCost: 1.50,
        profit: 500,
        currency: "USD"
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne])

      await request(app).get(`/v1/portfolios/${portfolioOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to get another user\'s portfolio', async () => {
      await insertUsers([userOne, userTwo]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      await request(app)
        .get(`/v1/portfolios/${portfolioThree._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and the portfolio object if admin is trying to get another user', async () => {
      await insertUsers([userOne, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      await request(app)
        .get(`/v1/portfolios/${portfolioOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
    });

    test('should return 400 error if portfolioId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      await request(app)
        .get('/v1/portfolios/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if portfolio is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/v1/portfolios/${portfolioOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /v1/portfolios/:userId', () => {
    test('should return 200 if user is trying to get their own portfolio using a userId and the portfolio object if data is ok', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      const res = await request(app)
        .get(`/v1/portfolios/user/${portfolioOne.user}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: portfolioOne._id.toHexString(),
        user: userOne._id.toHexString(),
        portfolioType: 'personal',
        currPortfolioValue: 50,
        initialFreeCash: 50,
        freeCash: 50, 
        transactionCost: 1.50,
        profit: 0,
        currency: "USD"
      });
    });

    test('should return 200 if admin is trying to get their own portfolio using a userId and the portfolio object if data is ok', async () => {
      await insertUsers([userOne, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      const res = await request(app)
        .get(`/v1/portfolios/user/${portfolioThree.user}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        id: portfolioThree._id.toHexString(),
        user: admin._id.toHexString(),
        portfolioType: 'tfsa',
        currPortfolioValue: 510,
        initialFreeCash: 600,
        freeCash: 500, 
        transactionCost: 1.50,
        profit: 500,
        currency: "USD"
      });
    });
  });

  describe('DELETE /v1/portfolios/:portfolioId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne])

      await request(app)
        .delete(`/v1/portfolios/${portfolioOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbPortfolio = await Portfolio.findById(portfolioOne._id);
      expect(dbPortfolio).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne])

      await request(app).delete(`/v1/portfolios/${portfolioOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to delete another user', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      await request(app)
        .delete(`/v1/portfolios/${portfolioThree._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 204 if admin is trying to delete another user', async () => {
      await insertUsers([userOne, admin]);
      await insertPortfolios([portfolioOne])

      await request(app)
        .delete(`/v1/portfolios/${portfolioOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
    });

    test('should return 400 error if portfolioId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/v1/portfolios/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if portfolio already is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/v1/portfolios/${portfolioOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/portfolios/:portfolioId', () => {
    test('should return 200 and successfully update portfolio if data is ok', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne])

      const updateBody = {
        portfolioType: 'personal',
        currPortfolioValue: 55,
        initialFreeCash: 55,
        freeCash: 55, 
        transactionCost: 1.70,
        profit: 0
      };

      const res = await request(app)
        .patch(`/v1/portfolios/${portfolioOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
          id: portfolioOne._id.toHexString(),
          user: userOne._id.toHexString(),
          portfolioType: 'personal',
          currPortfolioValue: 55,
          initialFreeCash: 55,
          freeCash: 55, 
          transactionCost: 1.70,
          profit: 0, 
          currency: "USD"
      });

      const dbPortfolio = await Portfolio.findById(portfolioOne._id);
      expect(dbPortfolio).toBeDefined();
      expect(dbPortfolio).toMatchObject({ user: userOne._id, portfolioType: updateBody.portfolioType, initialFreeCash: updateBody.initialFreeCash, 
        transactionCost: updateBody.transactionCost, currPortfolioValue: updateBody.currPortfolioValue, currency: "USD", freeCash: updateBody.freeCash});
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne])
      const updateBody = { portfolioType: "tfsa" };

      await request(app).patch(`/v1/portfolios/${portfolioOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is updating another user', async () => {
      await insertUsers([userOne, userTwo]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])

      const updateBody = { portfolioType: "tfsa" };

      await request(app)
        .patch(`/v1/portfolios/${portfolioThree._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and successfully update user if admin is updating another user', async () => {
      await insertUsers([userOne, admin]);
      await insertPortfolios([portfolioOne])
      const updateBody = { portfolioType: "tfsa" };

      await request(app)
        .patch(`/v1/portfolios/${portfolioOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);
    });

    test('should return 404 if admin is updating another user that is not found', async () => {
      await insertUsers([admin]);
      const updateBody = { portfolioType: "tfsa" };

      await request(app)
        .patch(`/v1/portfolios/${portfolioOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if userId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      const updateBody = { portfolioType: "tfsa" };

      await request(app)
        .patch(`/v1/portfolios/invalidId`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if number values are below 0', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne])
      const updateBody = { currPortfolioValue: -5, initialFreeCash: -5, freeCash: -5, transactionCost: -5 };

      await request(app)
        .patch(`/v1/portfolios/${portfolioOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
