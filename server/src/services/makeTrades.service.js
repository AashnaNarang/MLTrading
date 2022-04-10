var cron = require('node-cron');
const { symbols } = require('../config/stocks');
const { Portfolio, Security } = require('../models');
const { tradeService, machineLearningService, securityService, portfolioService } = require('../services');
const request = require('request');
const stocks = require('stock-ticker-symbol');

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

//This contains the symbol and its current price
const stock_map = new Map();

// Check if the request is empty or not
function isEmpty(empty) {
    return Object.keys(empty).length === 0 && empty.constructor === Object;
}

/**
 * 
 * @param {*} symbol 
 * @returns the current quote of the stock
 */
const getQuote = async (symbol) => {
    return new Promise(function (resolve, reject){
    let url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+symbol+'&apikey='+process.env.API_KEY;
    request.get({
        url: url,
        json: true,
        headers: {'User-Agent': 'request'}
    }, async (err, res, data) => {
        if (err) {
            console.log('Error:', err);
            reject(err);
        } else if (res.statusCode !== 200) {
            console.log('Status:', res.statusCode);
            return resolve(-1);
        } else {
            if (isEmpty(data)) {
                return resolve(-1);
            }
            let globalQuote = data['Global Quote'];
            let stockQuote = globalQuote['05. price'];
            if (stockQuote === undefined){
                // This will return -1 if Yahoo couldn't get the price either
                let price = await getYahooPrice(symbol);
                resolve(price);
            }
            resolve(stockQuote);
        }
    });
    })
}
// Job automatically runs every day at 9:30 am (00 seconds, 30 minutes, 09 hours)
const task = cron.schedule('00 46 18 * * *', async () => {
    console.log("Starting makeTrades Job");
    const prediction =  await machineLearningService.run();
    const buy = prediction.buy;
    const sell = prediction.sell;
    console.log(buy.length + " stocks have a buy indicator");
    console.log(sell.length + " stocks have a sell indicator");
    console.log("ML model ran");
    let purchaseMap = new Map();
    
    // Create a map for the stocks and price, this will be used to generate the list of securities we can afford
    for (element of symbols) {
        quote = await getQuote(element);
        if(quote === -1) {
            console.log("Ignoring " + element + " because AlphaVantage and Yahoo APIs could not get a price for it");
        } else {
            stock_map.set(element, quote);
        }
        await sleep(500); // Sleep for 0.5 seconds for amount of api calls we can make
    }
    console.log("Stock map " + stock_map)
    Portfolio.find({} , (err, portfolios) => {
        if (err) {
            console.log(err);
            throw new Error("Failed to get portfolios in makeTrades Job");
        }
        portfolios.map(async (portfolio) => {
            let securities = await Security.find({portfolio: portfolio.id}); 
            // Sell the securities first in order to have more free cash
            await sellSecurities(sell, await portfolioService.getPortfolioById(portfolio.id), securities);
            let done = false;
            let portfolioFreeCash = portfolio.freeCash;
            while (!done){
                let canAfford = await getSecuritiesWithBuyAndCanAfford(buy, portfolioFreeCash);
                console.log("CanAfford list for " + portfolio.id + " :" + canAfford);
                if (canAfford.length != 0) {
                    portfolioFreeCash = await selectStocksToBuy(purchaseMap, canAfford, portfolioFreeCash, await portfolioService.getPortfolioById(portfolio.id))
                    await sleep(1000); // Sleep for 1 seconds for amount of api calls we can make
                } else {
                    for (const [key, value] of purchaseMap.entries()) {
                        console.log(key, value);
                        await buySecurity(key, value, await portfolioService.getPortfolioById(portfolio.id));
                        await sleep(500); // Sleep for 0.5 seconds for amount of api calls we can make
                      }                      
                    done = true;
                }
            }
        });
    });

    console.log("Ran makeTrades job " + Date());
})


const sellSecurities = async (sell, portfolio, securities) => {
    for (let i = 0; i < securities.length; i++) {
        let security = securities[i];
        if (sell.includes(security.securityCode)) {
            await sellSecurity(portfolio, security);
        }
    }
}

const getSecuritiesWithBuyAndCanAfford = async (buy, portfolioFreeCash) => {
    let canAfford = [];
    for (let b of buy) {
        let price = stock_map.get(b);
        if(price < 0){
            console.log("There is an issue with " + b);
        }
        else if (price < portfolioFreeCash) {
            canAfford.push(b);
        }
    }
    return canAfford;
}

const sellSecurity = async (portfolio, security) => {
    let currPrice = await getYahooPrice(security.securityCode);
    if(currPrice === -1) {
        console.log("Yahoo API could not get a valid price for " + security.securityCode);
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
      freeCash: (portfolio.freeCash - portfolio.transactionCost + (currPrice * sharesForStock)).toFixed(2),
      profit: (portfolio.profit + profit).toFixed(2)
    });
    await securityService.updateSecurityById(security.id, {
        avgPrice: 0,
        shares: 0,
    });
    console.log("Sold 1 share of " + security.securityCode + " for portfolio: " + portfolio.id);
}

const buySecurity = async (code, value , portfolio) => {
    let currPrice = value[1];
    let sharesToBuy = value[0];
    Security.findOne({portfolio: portfolio.id, securityCode: code}, async function(err,security) { 
        if (security) {
            await securityService.updateSecurityById(security.id, {
                avgPrice: ((security.avgPrice * security.shares + (currPrice * sharesToBuy)) / (security.shares + sharesToBuy)).toFixed(2),
                shares: security.shares + sharesToBuy,
            });
        } else {
            let securityName = stocks.lookup(code);
            if (!securityName) {
                console.log("Couldn't find security name for " + code);
                return;
            }
            security = await securityService.createSecurity({
                 portfolio: portfolio.id,
                 securityName: securityName,
                 securityCode: code,
                 avgPrice: currPrice,
                 shares: sharesToBuy,
             });
        }
        await tradeService.addTrade({
            portfolio: portfolio.id,
            price: currPrice * sharesToBuy,
            action: "Purchased",
            security: security,
            sharesTraded: sharesToBuy,
        });
        await portfolioService.updatePortfolioById(portfolio.id, {
          freeCash: (portfolio.freeCash - (currPrice * sharesToBuy) - portfolio.transactionCost).toFixed(2),
        });
        console.log("Purchased a share of " + code + " for portfolio " + portfolio.id);
        return 0;
     });
    }


    const selectStocksToBuy = async (purchaseMap, canAfford, portfolioFreeCash, portfolio) => {
        let rndInt = randomIntFromInterval(0, canAfford.length - 1);
        let code = canAfford[rndInt];        
        // Getting current live price to be accurate
        let currPrice = await getYahooPrice(code);
        if (currPrice == -1){
            console.log("Could not get current price for " + code);
            return;
        }
        if(purchaseMap.has(code)){
            let updateValue = purchaseMap.get(code);
            purchaseMap.set(code, [updateValue[0]+1, updateValue[1]]);
            portfolioFreeCash = portfolioFreeCash - currPrice;
            return portfolioFreeCash;
        }else{            
            purchaseMap.set(code, [1, currPrice]);
            portfolioFreeCash = portfolioFreeCash - currPrice - portfolio.transactionCost;
            return portfolioFreeCash;

        }
    }
    

const getYahooPrice = async (symbol) => {
    return new Promise(function (resolve, reject){
        let url = 'https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=+'+ symbol;
        request.get({
            url: url,
            json: true,
            headers: {'User-Agent': 'request','X-API-KEY': `${process.env.YAHOO_KEY}`}
        }, (err, res, data) => {
            if (err) {
                console.log('Error:', err);
                reject(err);
            } else if (res.statusCode !== 200) {
                console.log('Status:', res.statusCode);
                return resolve(-1);
            } else {
                if(isEmpty(data)) {
                    return resolve(-1);
                }
                if(data === undefined) {
                    return resolve(-1);
                }
                let quoteResponse = data['quoteResponse'];
                let result = quoteResponse['result'];
                let quote = result[0];
                if (quote === undefined) {
                    return resolve(-1);
                }
                if (quote.regularMarketPrice === undefined) {
                    return resolve(-1);
                }
            resolve(quote.regularMarketPrice);
            }
        });
    })
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
