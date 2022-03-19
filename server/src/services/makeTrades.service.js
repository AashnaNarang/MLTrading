var cron = require('node-cron');
const { symbols } = require('../config/stocks');
const { Portfolio, Security, PortfolioValues } = require('../models');
const { tradeService, machineLearningService, portfolioValuesService, securityService , portfolioService} = require('../services');
const yahooFinance = require('yahoo-finance2').default;
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
const request = require('request');
const stocks = require('stock-ticker-symbol');

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
const task = cron.schedule('00 30 09 * * *', async () => {
    console.log("start");
    const prediction =  await machineLearningService.run();
    const buy = prediction.buy;
    const sell = prediction.sell;
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
            const quote = await yahooFinance.quote(b);
            price = quote.regularMarketPrice;
        }
        if (price < portfolio.freeCash) {
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
      freeCash: (portfolio.freeCash + (currPrice * sharesForStock)).toFixed(2),
      profit: (portfolio.profit + profit)
    });
    await securityService.updateSecurityById(code, {
        avgPrice: 0,
        shares: 0,
    });       
}

const buySecurities = async (canAfford, portfolio) => {
    let rndInt = randomIntFromInterval(0, canAfford.length - 1);
    let code = canAfford[rndInt];
    let freeCash = portfolio.freeCash;
    let currPrice = await getYahooPrice(code);

    let security = await Security.findOne({portfolio: portfolio.Id, securityCode: code});
    if (security) {
        await securityService.updateSecurityById(code, {
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
      freeCash: (freeCash - currPrice).toFixed(2),
    });
}


const getYahooPrice = async (code) => {
    let quote = await yahooFinance.quote(code);
    return quote.regularMarketPrice;
}
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