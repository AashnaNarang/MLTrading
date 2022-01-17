const { min } = require('moment');
const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const portfolioValuesSchema = mongoose.Schema(
  {
    portfolioId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Portfolio",
    },
    portfolioValue: {
      type: Number, 
      required: false
    },
    dateAdded: {
      type: Date, 
      required: true
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
portfolioValuesSchema.plugin(toJSON);
portfolioValuesSchema.plugin(paginate);


/**
 * @typedef PortfolioValues
 */
const PortfolioValues = mongoose.model('Portfolio_Values', portfolioValuesSchema);

module.exports = PortfolioValues;
