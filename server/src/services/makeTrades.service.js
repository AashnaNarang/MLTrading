var cron = require('node-cron');
const { symbols } = require('../config/stocks');
const { Portfolio, Security, PortfolioValues } = require('../models');
const { tradeService, machineLearningService, portfolioValuesService, securityService , portfolioService} = require('../services');
const yahooFinance = require('yahoo-finance2').default;
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
const request = require('request');
const stocks = require('stock-ticker-symbol');
// const { default: quote } = require('yahoo-finance2/dist/esm/src/modules/quote');

//This contains the symbol and its current price
const stock_map = new Map();

//check if the request is empty or not
function isEmpty(empty) {
    return Object.keys(empty).length === 0 && empty.constructor === Object;
}

/**
 * 
 * @param {*} symbol 
 * @returns the current quote of the stock
 */
function getQuote(symbol){
    return new Promise(function (resolve, reject){
    let url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+symbol+'&apikey='+process.env.API_KEY;
    request.get({
        url: url,
        json: true,
        headers: {'User-Agent': 'request'}
    }, (err, res, data) => {
        if (err) {
        console.log('Error:', err);
        reject(err);
        } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode);
        } else {
            if(isEmpty(data)){
                return resolve(0);
            }
        let globalQuote = data['Global Quote'];
        let stockQuote = globalQuote['05. price'];
        if(stockQuote === undefined){
            //this is for some quotes that would be pulled by yahoo stock
            stockQuote = -1;
        }
        resolve(stockQuote);
        }
    });
    })
    
}
// job automatically runs every day at 9:30 am (00 seconds, 30 minutes, 09 hours)
const task = cron.schedule('00 28 09 * * *', async () => {
    console.log("start");
    const prediction =  await machineLearningService.run();
    const buy = prediction.buy;
    const sell = prediction.sell;
    console.log("Model ran");
    //create a map for the stocks and price
    //the price will return a json body request, need to parse and find the askPrice
    for(element of symbols){
        stock_map.set(element, await getQuote(element));
        await sleep(1000); // sleep for 1 seconds for api
    }
    Portfolio.find({} , (err, portfolios) => {
        if (err) {
            console.log(err);
            throw new Error("Failed to get portfolios in makeTradesJob");
        }
        portfolios.map(async (portfolio) => {
            let securities = await Security.find({portfolio: portfolio.id}); 
            // await portfolioService.updatePortfolioById(portfolio.id, {
            //     currPortfolioValue: 2000,
            //     freeCash: 5000,
            //   });
            //sell the securities in order to have more free cash
            await sellSecurities(sell, await portfolioService.getPortfolioById(portfolio.id), securities);
            let done = false;
            while (!done){
                let canAfford = await getSecuritiesWithBuyAndCanAfford(buy, await portfolioService.getPortfolioById(portfolio.id));
                // console.log("we can afford this : " + canAfford);
                if (canAfford.length != 0) {
                    await buySecurities(canAfford, await portfolioService.getPortfolioById(portfolio.id));
                    await sleep(3000); // sleep for 3 seconds for amount of api calls we can make
                } else {
                    done = true;
                }
            }
        });
    });

    console.log("Ran " + Date());
})


const sellSecurities = async (sell, portfolio, securities) => {
    for (let i = 0; i < securities.length; i++) {
        let security = securities[i];
        if (sell.includes(security.securityCode)) {
            await sellSecurity(portfolio, security);
        }
    }
}

const getSecuritiesWithBuyAndCanAfford = async (buy, portfolio) => {
    let canAfford = [];
    for (let b of buy) {
        let price = stock_map.get(b);
        if(price == -1){
            console.log("dont")
        }
        else if (price < portfolio.freeCash) {
            canAfford.push(b);
        }
    }
    return canAfford;
}

const sellSecurity = async (portfolio, security) => {
    let currPrice = await getYahooPrice(security.securityCode);
    // console.log("the code is : " + security.securityCode);
    // console.log("the current price is : " + currPrice);
    if(typeof currPrice === 'undefined'){
        return;
    }
    let sharesForStock = security.shares;
    let profit = (currPrice * sharesForStock) - (security.avgPrice * sharesForStock);
    let currPortfolioVal =  (portfolio.currPortfolioValue + (currPrice * sharesForStock)).toFixed(2);
    await tradeService.addTrade({
        portfolio: portfolio.id,
        price: currPrice,
        action: "Sold",
        security: security,
        sharesTraded: sharesForStock,
    });

    await portfolioService.updatePortfolioById(portfolio.id, {
      currPortfolioValue: currPortfolioVal,
      freeCash: (portfolio.freeCash - 1.5 + (currPrice * sharesForStock)).toFixed(2),
      profit: (portfolio.profit + profit).toFixed(2)
    });
    await securityService.updateSecurityById(security.id, {
        avgPrice: 0,
        shares: 0,
    });       
}

const buySecurities = async (canAfford, portfolio) => {
    let rndInt = randomIntFromInterval(0, canAfford.length - 1);
    let code = canAfford[rndInt];
    let freeCash = portfolio.freeCash;
    let currPrice = await getYahooPrice(code);
    console.log("current price is  " + currPrice);
    if(currPrice == -1){
        return;
    }
    console.log(portfolio.id);
    let securities = await Security.find({portfolio: portfolio.id});
    let flag = false;
    let security;
    for (let i = 0; i < securities.length; i++) {
        let x = securities[i];
        console.log("x " + x.securityCode);
        console.log("code " + code);
        if (code == x.securityCode) {
            flag = true;
            security = x;
            break;
        }
    }
    if (flag) {
        console.log("heyyyy")
        console.log(security);
        await securityService.updateSecurityById(security.id, {
            avgPrice: ((security.avgPrice * security.shares + currPrice) / (security.shares + 1)).toFixed(2),
            shares: security.shares + 1,
        });       
    } else {
        security = await securityService.createSecurity({
             portfolio: portfolio.id,
             securityName: stocks.lookup(code),
             securityCode: code,
             avgPrice: currPrice,
             shares: 1,
         });
    }
    await tradeService.addTrade({
        portfolio: portfolio.id,
        price: currPrice,
        action: "Purchased",
        security: security,
        sharesTraded: 1,
    });
    await portfolioService.updatePortfolioById(portfolio.id, {
      freeCash: (freeCash - currPrice - 1.5).toFixed(2),
    });
}


    // Security.findOne({portfolio: portfolio.id, securityCode: code}, async function(err,security) { 
    //     console.log(security);
    //     if (security) {
    //         await securityService.updateSecurityById(security.id, {
    //             avgPrice: ((security.avgPrice * security.shares + currPrice) / (security.shares + 1)).toFixed(2),
    //             shares: security.shares + 1,
    //         });       
    //     } else {
    //         security = await securityService.createSecurity({
    //              portfolio: portfolio.id,
    //              securityName: stocks.lookup(code),
    //              securityCode: code,
    //              avgPrice: currPrice,
    //              shares: 1,
    //          });
    //     }
    //     await tradeService.addTrade({
    //         portfolio: portfolio.id,
    //         price: currPrice,
    //         action: "Purchased",
    //         security: security,
    //         sharesTraded: 1,
    //     });
    //     await portfolioService.updatePortfolioById(portfolio.id, {
    //       freeCash: (freeCash - currPrice - 1.5).toFixed(2),
    //     });
    //  });
    // }




const getYahooPrice = async (symbol) => {
//     let quote = await yahooFinance.quote(code);
//     return quote.regularMarketPrice;
return new Promise(function (resolve, reject){
    let url = 'https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=+'+ symbol;
    request.get({
        url: url,
        json: true,
        headers: {'User-Agent': 'request','X-API-KEY': 'xAX9wtCgov27Lj2oof5Zu51wxHt5Cqp4K2TMaADj'}
    }, (err, res, data) => {
        if (err) {
        console.log('Error:', err);
        reject(err);
        } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode);
        } else {
            if(isEmpty(data)){
                return resolve(-1);
            }
            if(data === undefined){
                return resolve(-1);
            }
            let quoteResponse = data['quoteResponse'];
            let result = quoteResponse['result'];
            let gg = result[0];
            console.log("Gg" + gg);
            if(gg === undefined){
                return resolve(-1);
            }
            if(gg.regularMarketPrice === undefined){
                return resolve(-1);
            }
        resolve(gg.regularMarketPrice);
        }
    });
    })
}
// }
/**
 * 
 * @param {*} min 
 * @param {*} max 
 * @returns a random int from the interval given 
 */
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = task;