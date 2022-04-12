var cron = require('node-cron');
const { portfolioValuesService } = require('../services');

// job automatically runs every day at 12 am (00 seconds, 00 minutes, 00 hours)
const task = cron.schedule('00 20 03 * * *', () => {
    try {
        portfolioValuesService.addPortfolioValuesJob();
    } catch (error) {
        console.log("Skip job " + error + Date());
    }
    console.log("Ran add portfolio values " + Date());
})

module.exports = task;