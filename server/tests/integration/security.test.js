const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Portfolio, Security } = require('../../src/models');
const { portfolioOne, portfolioTwo, portfolioThree, insertPortfolios } = require('../fixtures/portfolio.fixture');
const { userOne, userTwo, admin, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');
const { securityOne, securityTwo, securityThree, securityFour, insertSecurities } = require('../fixtures/security.fixture');

setupTestDB();

describe('Securities routes', () => {
  describe('POST /v1/securities', () => {
    let newSecurity;

    beforeEach(() => {
      newSecurity = {
        portfolio: portfolioOne._id, 
        securityName: "Shopify", 
        securityCode: "SHOP", 
        avgPrice: 807.33, 
        shares: 5,
      };
    });

    test('should return 201 and successfully create a new security if data is ok', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne]);

      const res = await request(app)
        .post('/v1/securities')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newSecurity)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        portfolio: portfolioOne._id.toHexString(), 
        securityName: "Shopify", 
        securityCode: "SHOP", 
        avgPrice: 807.33, 
        shares: 5,
        totalValue: 4036.65,
        lastUpdated: expect.anything()
      });

      const dbSecurity = await Security.findById(res.body.id);
      expect(dbSecurity).toBeDefined();
      expect(dbSecurity).toMatchObject({ id: expect.anything(), portfolio: newSecurity.portfolio, securityName: newSecurity.securityName, securityCode: newSecurity.securityCode, 
        avgPrice: newSecurity.avgPrice, shares: newSecurity.shares, totalValue: 4036.65, lastUpdated: expect.anything()});
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/securities').send(newSecurity).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 error if portfolio does not exist', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/securities')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newSecurity)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if number values are below 0', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne]);
      newSecurity.avgPrice = -5.0;
      newSecurity.shares = -5.0; 

      await request(app)
        .post('/v1/securities')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newSecurity)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/securities', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([admin, userOne]);
      await insertPortfolios([portfolioOne, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);

      const res = await request(app)
        .get(`/v1/securities`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ portfolio: portfolioOne._id.toHexString() })
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
      expect(res.body.results[0].portfolio).toEqual(portfolioOne._id.toHexString());
      expect(res.body.results[1].portfolio).toEqual(portfolioOne._id.toHexString());
    });

    test('should return 401 if access token is missing', async () => {
      await insertUsers([admin, userOne]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour])

      await request(app).get('/v1/securities')
        .query({ portfolio: portfolioOne._id.toHexString() })
        .send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if trying to query securities from someone else\'s portfolio', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);

      await request(app)
        .get('/v1/securities')
        .query({ portfolio: portfolioOne._id.toHexString() })
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);

      const res = await request(app)
        .get('/v1/securities')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ portfolio: portfolioOne._id.toHexString() })
        .query({ sortBy: 'lastUpdated:desc' })
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
      expect(res.body.results[0].id).toBe(securityOne._id.toHexString());
      expect(res.body.results[1].id).toBe(securityTwo._id.toHexString());
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);

      const res = await request(app)
        .get('/v1/securities')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ portfolio: portfolioOne._id.toHexString() })
        .query({ sortBy: 'lastUpdated:asc' })
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
      expect(res.body.results[0].id).toBe(securityTwo._id.toHexString());
      expect(res.body.results[1].id).toBe(securityOne._id.toHexString());
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);

      const res = await request(app)
        .get('/v1/securities')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ portfolio: portfolioOne._id.toHexString() })
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(securityOne._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);

      const res = await request(app)
        .get('/v1/securities')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ portfolio: portfolioOne._id.toHexString() })
        .query({ limit: 1, page: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(securityTwo._id.toHexString());
    });
  });

  describe('GET /v1/securities/:securityId', () => {
    test('should return 200 if user is trying to get their own security and the security object if data is ok', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne])
      await insertSecurities([securityOne]);

      const res = await request(app)
        .get(`/v1/securities/${securityOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        currentPrice: expect.anything(),
        currTotalValue: expect.anything(), 
        totalReturn: expect.anything(),
        security: {
            id: securityOne._id.toHexString(),
            portfolio: portfolioOne._id.toHexString(), 
            securityName: "Shopify", 
            securityCode: "SHOP", 
            avgPrice: 807.33, 
            shares: 5,
            totalValue: 4036.65,
            lastUpdated: expect.anything()
        }
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne]);
      await insertSecurities([securityOne]);

      await request(app).get(`/v1/securities/${securityOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to get another portfolios\'s security', async () => {
      await insertUsers([userOne, userTwo, admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);

      await request(app)
        .get(`/v1/securities/${securityFour._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if securityId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree]);
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);

      await request(app)
        .get('/v1/securities/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if security is not found', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne]);

      await request(app)
        .get(`/v1/securities/${securityOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/securities/:securityId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne]);
      await insertSecurities([securityOne]);

      await request(app)
        .delete(`/v1/securities/${securityOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbSecurity = await Security.findById(securityOne._id);
      expect(dbSecurity).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne])
      await insertSecurities([securityOne]);

      await request(app).delete(`/v1/securities/${securityOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to delete another portfolio\'s security', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree])
      await insertSecurities([securityOne, securityTwo, securityThree, securityFour]);

      await request(app)
        .delete(`/v1/securities/${securityFour._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if securityId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/v1/securities/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if security is not found', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne, portfolioTwo]);

      await request(app)
        .delete(`/v1/securities/${securityOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/securities/:securityId', () => {
    test('should return 200 and successfully update portfolio if data is ok', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne, portfolioTwo])
      await insertSecurities([securityOne]);


      const updateBody = {
        securityName: "Amazon", 
        securityCode: "AMZN",
      };

      const res = await request(app)
        .patch(`/v1/securities/${securityOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
          id: securityOne._id.toHexString(),
          portfolio: portfolioOne._id.toHexString(),
          securityName: "Amazon", 
          securityCode: "AMZN", 
          avgPrice: 807.33, 
          shares: 5,
          totalValue: 4036.65,
          lastUpdated: expect.anything()
      });

      const dbSecurity = await Security.findById(securityOne._id);
      expect(dbSecurity).toBeDefined();
      expect(dbSecurity).toMatchObject({ id: expect.anything(), portfolio: securityOne.portfolio, securityName: updateBody.securityName, securityCode: updateBody.securityCode, 
        avgPrice: securityOne.avgPrice, shares: securityOne.shares, totalValue: securityOne.totalValue, lastUpdated: expect.anything()});
    });

    test('should return 404 and do not update portfolio if portfolio id in update body is not yours', async () => {
        await insertUsers([userOne]);
        await insertPortfolios([portfolioOne])
        await insertSecurities([securityOne]);


        const updateBody = {
        portfolio: portfolioTwo._id, 
        avgPrice: 1234.45,
        shares: 3
        };

        await request(app)
        .patch(`/v1/securities/${securityOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 200 and successfully update portfolio if data is ok - more complex', async () => {
        await insertUsers([userOne]);
        await insertPortfolios([portfolioOne, portfolioTwo])
        await insertSecurities([securityOne]);


        const updateBody = {
        portfolio: portfolioTwo._id, 
        avgPrice: 1234.45,
        shares: 3
        };

        const res = await request(app)
        .patch(`/v1/securities/${securityOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

        expect(res.body).toEqual({
            id: securityOne._id.toHexString(),
            portfolio: portfolioTwo._id.toHexString(),
            securityName: "Shopify", 
            securityCode: "SHOP", 
            avgPrice: 1234.45, 
            shares: 3,
            totalValue: 3703.3500000000004,
            lastUpdated: expect.anything()
        });

        const dbSecurity = await Security.findById(securityOne._id);
        expect(dbSecurity).toBeDefined();
        expect(dbSecurity).toMatchObject({ id: expect.anything(), portfolio: portfolioTwo._id, securityName: securityOne.securityName, securityCode: securityOne.securityCode, 
        avgPrice: updateBody.avgPrice, shares: updateBody.shares, totalValue: 3703.3500000000004, lastUpdated: expect.anything()});
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne])
      await insertSecurities([securityOne]);
      const updateBody = { securityCode: "AMZN" };

      await request(app).patch(`/v1/securities/${securityOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if user is updating another portfolio\'s security', async () => {
      await insertUsers([userOne, userTwo]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree]);
      await insertSecurities([securityOne]);

      const updateBody = { securityCode: "AMZN" };

      await request(app)
        .patch(`/v1/securities/${securityOne._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.FORBIDDEN);
    });


    test('should return 404 if security is not found', async () => {
        await insertUsers([userOne, userTwo]);
        await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree]);
        const updateBody = { securityCode: "AMZN" };

      await request(app)
        .patch(`/v1/securities/${securityOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if securityId is not a valid mongo id', async () => {
      await insertUsers([userOne, userTwo]);
      await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree]);
      await insertSecurities([securityOne]);
      const updateBody = { securityCode: "AMZN" };

      await request(app)
        .patch(`/v1/securities/invalidId`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if number values are below 0', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne])
      await insertSecurities([securityOne]);
      const updateBody = { avgPrice: -5, shares: -5, totalValue: -5 };

      await request(app)
        .patch(`/v1/securities/${securityOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
