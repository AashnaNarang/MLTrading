var cron = require('node-cron');
const { symbols } = require('../config/stocks');
const { Portfolio, Security, PortfolioValues } = require('../models');
const { tradeService, machineLearningService, portfolioValuesService, securityService } = require('../services');
const yahooFinance = require('yahoo-finance2').default;
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
const request = require('request');

const stock_map = new Map();

// job automatically runs every day at 9:30 am (00 seconds, 30 minutes, 09 hours)
const task = cron.schedule('00 30 09 * * *', () => {
    let predictions =  machineLearningService.run();
    let buy = predictions.buy;
    let sell = predictions.sell;
    let stockPrices = []
    //create a map for the stocks and price
    //the price will return a json body request, need to parse and find the askPrice
    for(element of symbols){
        map.set(element, await getQuote(element));
        await sleep(1000); // sleep for 1 seconds
    }
    // call tiingo to get all current stock prices and maybe combine buy and sell objects with prices
    Portfolio.find({} , (err, portfolios) => {
        if (err) {
            console.log(err);
            throw new Error("Failed to get portfolios in makeTradesJob");
        }
        portfolios.map(async (portfolio) => {
            let securities = await Security.find({portfolioId: portfolio.id});
            //for add trades its body says portfolio
            sellSecurities(sell, portfolio, securities);
            let done = false;
            while (!done){
                let canAfford = getSecuritiesWithBuyAndCanAfford(buy, portfolio, stockPrices);
                if (canAfford.length != 0) {
                    await buySecurities(canAfford, portfolio.id, securities);
                } else {
                    done = true;
                }
            }
        });
    });

    console.log("Ran " + Date());
})

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
const sellSecurities = (sell, portfolio, securities) => {
    for (let i = 0; i < securities.length; i++) {
        let security = securities[i];
        if (sell.includes(security.securityCode)) {
            sellSecurity(portfolio, security);
        }
    }
}

const getSecuritiesWithBuyAndCanAfford = (buy, portfolio) => {
    let canAfford = [];
    for (let b in buy) {
        let price = stock_map[b];
        if(price === -1){
            price = yahooFinance.quote(b)
        }
        //we could just randomly select from here and minus free cash while we are at it?
        if (price < portfolio.freeCash) {
            canAfford.push(b);
        }
    }
    return canAfford;
}

const sellSecurity = (portfolio, security) => {
    const quote = await yahooFinance.quote(security);
    let currPrice = quote.regularMarketPrice;
    await tradeService.addTrade({
        portfolio: portfolio,
        price: currPrice, //getstockprice,
        action: "Sold",
        security: security,
        sharesTraded: 1
    });
    await securityService.updateSecurityById(security.id, {
        portfolio: portfolio,
        shares: 1
    });
    //adding profit?
   
    await addPortfolioValue({
        portfolioId: portfolio.id, 
        portfolioValue: portfolio.freeCash + (currPrice * sharesSold)
    });
    await portfolioService.updatePortfolioById(portfolio.id, {
      currPortfolioValue: portfolioValue, 
    });

    // call trades service to add trade
    // update security using security service
}

const buySecurities = async (canAfford, portfolioId, securities) => {
    let rndInt = randomIntFromInterval(0, canAfford.length - 1);
    let code = canAfford[rndInt];
    const quote = await yahooFinance.quote(code);
    let currPrice = quote.regularMarketPrice;
    let security = await Security.findOne({portfolio: portfolioId, securityCode: code});
    if (security) {
        await securityService.updateSecurityById(code, {
            portfolio: portfolio,
            shares: 1
        });        // update security by purchasing one share of the stock
    } else {
        //slightly confused on security code and securityName
        //create a security and purchase it 
        securityService.createSecurity({
            portfolio: portfolio,
            securityName: code,
            securityCode: code,
            avgPrice: quote,
            shares: 1
        });
    }
    //add trade 
    await tradeService.addTrade({
        portfolio: portfolio,
        price: currPrice, //getstockprice,
        action: "Bought",
        security: security,
        sharesTraded: 1
    });

    //remove from free cash 
    await addPortfolioValue({
        portfolioId: portfolio.id, 
        portfolioValue: portfolio.freeCash - currPrice
    });
    await portfolioService.updatePortfolioById(portfolio.id, {
      currPortfolioValue: portfolioValue, 
    });

    // add trade
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