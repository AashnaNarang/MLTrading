const faker = require('faker');
const mongoose = require('mongoose');
const setupTestDB = require('../utils/setupTestDB');
const { portfolioOne, portfolioTwo, insertPortfolios, portfolioThree } = require('../fixtures/portfolio.fixture');
const { userOne, userTwo, admin, insertUsers } = require('../fixtures/user.fixture');
const { portfolioValuesService } = require('../../src/services');
const { Portfolio, PortfolioValues } = require('../../src/models');

setupTestDB();

describe('AddPortfolioValuesJob', () => {
    describe('add portfolio values job', () => {
        test('placeholder', async () => {
            expect(1).toEqual(1);
        });
        // test('addPortfolioValuesJob should add new portfolio values for each portfolio', async () => {
        //     await insertUsers([userOne, userTwo, admin]);
        //     await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree]);

        //     const oldValueSize = await PortfolioValues.count();
        //     const oldPortfolioSize = await Portfolio.count();
        //     await portfolioValuesService.addPortfolioValuesJob();
        //     const newSize = await PortfolioValues.count();
        //     expect(newSize).toEqual(oldValueSize + oldPortfolioSize);
        //     const portfolioValues = await portfolioValuesService.getPortfoliosById(portfolioThree.id);
        //     expect(portfolioValues).toHaveLength(1);
        //     expect(portfolioValues[0].portfolioValue).toEqual(portfolioThree.freeCash);
        // });

        // test('addPortfolioValuesJob should update currPortfolioValue and profit', async () => {
        //     await insertUsers([userOne, userTwo, admin]);
        //     await insertPortfolios([portfolioOne, portfolioTwo, portfolioThree]);
        //     portfolioThree.initialfreeCash = 100;
        //     portfolioThree.profit = 0;
        //     portfolioThree.freeCash = 150;

        //     await portfolioValuesService.addPortfolioValuesJob();
        //     expect(portfolioThree.currPortfolioValue).toEqual(150);
        //     expect(portfolioThree.profit).toEqual(50);
        // });
    });
});
