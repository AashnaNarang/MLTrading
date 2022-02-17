var cron = require('node-cron');
const { Portfolio, Security } = require('../models');
const { tradeService } = require('../services');
const yahooFinance = require('yahoo-finance2').default;

// job automatically runs every day at 9:30 am (00 seconds, 30 minutes, 09 hours)
const task = cron.schedule('00 30 09 * * *', () => {
    let data =  mlModelService.run()
    let buy = data.buy
    let sell = data.sell
    let stockPrices = []
    // call tiingo to get all current stock prices and maybe combine buy and sell objects with prices
    Portfolio.find({} , (err, portfolios) => {
        if (err) {
            console.log(err);
            throw new Error("Failed to get portfolios in makeTradesJob");
        }
        portfolios.map(async (portfolio) => {
            let securities = await Security.find({portfolioId: portfolio.id});
            sellSecurities(sell, portfolio.id, securities);
            let done = false;
            while (!done){
                let canAfford = getSecuritiesWithBuyAndCanAfford(buy, portfolio, stockPrices);
                if (canAfford.length > 0) {
                    await buySecurities(canAfford, portfolio.id, securities);
                } else {
                    done = true;
                }
            }
        });
    });

    console.log("Ran " + Date());
})

const sellSecurities = (sell, portfolioId, securities) => {
    for (let i = 0; i < securities.length; i++) {
        let security = securities[i];
        if (sell.includes(security.securityCode)) {
            sellSecurity(portfolioId, security);
        }
    }
}

const getSecuritiesWithBuyAndCanAfford = (buy, portfolio, stockPrices) => {
    let canAfford = [];
    for (let b in buy) {
        let price = stockPrices[b];
        if (price < portfolio.freeCash) {
            canAfford.push(b);
        }
    }
    return canAfford;
}

const sellSecurity = (portfolioId, security) => {
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
        // update security
    } else {
        // make new security
    }
    // add trade
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = task;