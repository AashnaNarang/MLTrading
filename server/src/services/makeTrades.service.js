var cron = require('node-cron');
const { symbols } = require('../config/stocks');
const { Portfolio, Security, PortfolioValues } = require('../models');
const { tradeService, machineLearningService, portfolioValuesService, securityService , portfolioService} = require('../services');
const yahooFinance = require('yahoo-finance2').default;
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
const request = require('request');

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
//  if (typeof myVar === "undefined")

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
const task = cron.schedule('00 40 16 * * *', async () => {
    console.log("start");
    let prediction =  await machineLearningService.run();
    const buy = prediction.buy;
    const sell = prediction.sell;
    console.log(buy);
    console.log(sell);
    //check if securities exist, if not create them. 

    //create a map for the stocks and price
    //the price will return a json body request, need to parse and find the askPrice
    for(element of symbols){
        stock_map.set(element, await getQuote(element));
        await sleep(1000); // sleep for 1 seconds
    }
    console.log(stock_map.values())
    // call tiingo to get all current stock prices and maybe combine buy and sell objects with prices
    Portfolio.find({} , (err, portfolios) => {
        if (err) {
            console.log(err);
            throw new Error("Failed to get portfolios in makeTradesJob");
        }
        portfolios.map(async (portfolio) => {
            console.log("port id " + portfolio.id);
            console.log("port id " + portfolio);
            let securities = await Security.find({portfolio: portfolio.id}); //This returns nothing
            console.log("list of sec " + securities);
            sellSecurities(sell, portfolio, securities);
            let done = false;
            let count = 0 // for testing purposes 
            while (!done && count !== 10){
                let canAfford = await getSecuritiesWithBuyAndCanAfford(buy, portfolio);
                console.log(canAfford.toString());
                if (canAfford.length != 0) {
                    await buySecurities(canAfford, portfolio, securities);
                    count++;
                } else {
                    done = true;
                }
            }
        });
    });

    console.log("Ran " + Date());
})


const sellSecurities = async (sell, portfolio, securities) => {
    console.log("sell securities length" + securities.length);
    for (let i = 0; i < securities.length; i++) {
        let security = securities[i];
        console.log("selling list" + securities);
        console.log("selling stock " + security);
        if (sell.includes(security.securityCode)) {
            await sellSecurity(portfolio, security);
        }
    }
}

const getSecuritiesWithBuyAndCanAfford = async (buy, portfolio) => {
    let canAfford = [];
    for (let b of buy) {
        // const quote = await yahooFinance.quote(b);
        // console.log(quote);
        // let currPrice = quote.regularMarketPrice;
        // console.log(currPrice);
        let price = stock_map.get(b);
        if(price === -1){
            // price = await yahooFinance.quote(b);
            price = 1;
        }
        if (price < portfolio.freeCash) {
            canAfford.push(b);
        }
    }
    return canAfford;
}

const sellSecurity = async (portfolio, security) => {
    const quote = await yahooFinance.quote(security);
    console.log("quote here:" + quote);
    let currPrice = quote.regularMarketPrice;
    console.log("currPrice here:" + currPrice);
    await tradeService.addTrade({
        portfolio: portfolio,
        price: currPrice, //getstockprice,
        action: "Sold",
        security: security,
        //what do i call to get all shares to trade
        sharesTraded: 1,
    });
    await securityService.updateSecurityById(security.id, {
        shares: 0,
    });
    //adding profit?
    console.log("Portfoilo sell vales: " + portfolio);
   
    await portfolioValuesService.addPortfolioValue({
        portfolioId: portfolio.id, 
        portfolioValue: portfolio.freeCash + (currPrice * sharesSold)
    });
    await portfolioService.updatePortfolioById(portfolio.id, {
      currPortfolioValue: portfolioValue, 
    });

    // call trades service to add trade
    // update security using security service
}

const buySecurities = async (canAfford, portfolio, securities) => {
    let rndInt = randomIntFromInterval(0, canAfford.length - 1);
    let code = canAfford[rndInt];
    console.log("the current code sending " + code);
    //enough time to use the map to get quote? or too long?
    let currPrice = await getQuote(code);
    await sleep(1000); // sleep for 1 seconds
    console.log("The current price" + currPrice);
    // there is an issue with yahoofinance
    if(currPrice === -1){
        currPrice = 1;
        //having errors with this, but i can also get name so will put it later
        // const quote = await yahooFinance.quote(code);
        // currPrice = quote.regularMarketPrice;
    }
    let security = await Security.findOne({portfolio: portfolio.Id, securityCode: code});
    console.log("The secuiryt" + security);
    if (security) {
        await securityService.updateSecurityById(code, {
            shares: 1,
            // currShares + 1,
        });        // update security by purchasing one share of the stock
    } else {
        console.log("Buy secuirty code" + code);
        //slightly confused on security code and securityName
        //create a security and purchase it 
        // securityService.createSecurity({
        //     portfolio: portfolio,
        //     securityName: code,
        //     securityCode: code,
        //     avgPrice: currPrice,
        //     shares: 1,
        //     // currShares + 1
        // });
    }
    //add trade 
    // await tradeService.addTrade({
    //     portfolio: portfolio,
    //     price: currPrice, //getstockprice,
    //     action: "Purchased",
    //     security: security,
    //     sharesTraded: 1,
    // });

    //remove from free cash 
    await portfolioValuesService.addPortfolioValue({
        portfolioId: portfolio.id, 
        portfolioValue: portfolio.freeCash - currPrice,
    });
    await portfolioService.updatePortfolioById(portfolio.id, {
      currPortfolioValue: portfolio.freeCash - currPrice, 
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