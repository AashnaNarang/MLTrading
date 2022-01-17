const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { PortfolioValues } = require('../../src/models');
const { portfolioValueOne, portfolioValueTwo, portfolioValueThree, insertPortfolioValues } = require('../fixtures/portfolioValue.fixture');
const { portfolioOne, portfolioTwo, insertPortfolios, portfolioThree } = require('../fixtures/portfolio.fixture');
const { userOne, userTwo, admin, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Portfolio Values routes', () => {
  describe('POST /v1/values', () => {
    let newPortfolioValue;

    beforeEach(() => {
      newPortfolioValue = {
        portfolioId: portfolioOne._id,
        portfolioValue: 150
      };
    });

    test('should return 201 and successfully create new portfolio value if data is ok', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne]);
      await insertPortfolioValues([portfolioValueOne]);

      const res = await request(app)
        .post('/v1/values')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newPortfolioValue)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        portfolioId: portfolioOne._id.toHexString(),
        portfolioValue: 150,
        dateAdded: expect.anything()
      });

      const dbPortfolioValue = await PortfolioValues.findById(res.body.id);
      expect(dbPortfolioValue).toBeDefined();
      expect(dbPortfolioValue).toMatchObject({ id: expect.anything(), portfolioId: newPortfolioValue.portfolioId, portfolioValue: newPortfolioValue.portfolioValue});
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/values').send(newPortfolioValue).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 error if portfolio does not exist', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post('/v1/values')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newPortfolioValue)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /v1/values/:portfolioId', () => {
    test('should return 200 if user is trying to get their own portfolio values and the object if data is ok', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne, portfolioTwo]);
      await insertPortfolioValues([portfolioValueOne, portfolioValueThree]);

      const res = await request(app)
        .get(`/v1/values/${portfolioOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body[0]).toEqual({
        id: portfolioValueOne._id.toHexString(),
        portfolioId: portfolioOne._id.toHexString(),
        portfolioValue: 50,
        dateAdded: expect.anything()
      });
    });

    test('should return portfolio values that are within the last year for a portfolio', async () => {
        await insertUsers([userOne]);
        await insertPortfolios([portfolioOne, portfolioTwo]);
        await insertPortfolioValues([portfolioValueOne, portfolioValueTwo, portfolioValueThree]);
        portfolioOne.dateAdded = new Date(new Date().setMonth(new Date().getMonth() - 3));
        portfolioTwo.dateAdded = new Date(new Date().setFullYear(new Date().getFullYear() - 2));
        
        const res = await request(app)
          .get(`/v1/values/${portfolioOne._id}`)
          .set('Authorization', `Bearer ${userOneAccessToken}`)
          .send()
          .expect(httpStatus.OK);
  
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toEqual({
          id: portfolioValueOne._id.toHexString(),
          portfolioId: portfolioOne._id.toHexString(),
          portfolioValue: 50,
          dateAdded: expect.anything()
        });
      });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne])

      await request(app).get(`/v1/values/${portfolioOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 error if user is trying to get another portfolio\'s values from a portfolio of another user', async () => {
      await insertUsers([userOne, userTwo]);
      await insertPortfolios([portfolioOne, portfolioThree]);
      await insertPortfolioValues([portfolioValueOne, portfolioValueTwo, portfolioValueThree]);

      await request(app)
        .get(`/v1/values/${portfolioThree._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 403 if admin is trying to get portfolio values of a portfolio of another user', async () => {
      await insertUsers([userOne, admin]);
      await insertPortfolios([portfolioOne, portfolioThree])

      await request(app)
        .get(`/v1/values/${portfolioOne._id}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should return 400 error if portfolioId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertPortfolios([portfolioThree])

      await request(app)
        .get('/v1/values/invalidId')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 200 code and empty array if portfolio values for that portfolio are not found', async () => {
      await insertUsers([userOne]);
      await insertPortfolios([portfolioOne]);

      const res = await request(app)
        .get(`/v1/values/${portfolioOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);
      expect(res.body).toHaveLength(0);
    });
  });
});
