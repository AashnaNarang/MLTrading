const { min } = require('moment');
const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');

const portfolioSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    portfolioType: {
      type: String, 
      required: true,
      default: "personal",
      enum: {
        values: ["tfsa", "personal", "rrsp"],
        message: "{VALUE} is not supported"
      }
    },
    currPortfolioValue: {
      type: Number, 
      required: false
    },
    profit: {
      type: Number, 
      required: true
    },
    initialFreeCash: {
      type: Number, 
      required: true,
      min: [0.0, "Needs to be a valid dollar value"]
    },
    freeCash: {
      type: Number, 
      required: true,
      min: [0.0, "Needs to be a valid dollar value"]
    }, 
    transactionCost: {
      type: Number,
      required: true,
      min: [0.0, "Needs to be a valid dollar value"], 
      default: 1.50
    }, 
    currency: {
      type: String,
      enum: {
        values: ["USD"],   // Make sure we only accept this one value
        message: "{VALUE} is not supported"
      },
      required: true, 
      default: "USD"
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
portfolioSchema.plugin(toJSON);
portfolioSchema.plugin(paginate);


/**
 * @typedef Portfolio
 */
const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;
