const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const tradeSchema = mongoose.Schema(
  {
    portfolio: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Portfolio",
    },
    action: {
      type: String, 
      required: true,
      enum: {
        values: ["Purchased", "Sold"],
        message: "{VALUE} is not supported"
      }
    },
    price: {
      type: Number, 
      required: true,
      min: [0.0, "Needs to be a valid dollar value"],
    },
    security: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Security",
    },
    securityCode: {
      type: String, 
      required: true
    },
    sharesTraded: {
      type: Number, 
      required: true, 
      min: [0.0, "Shares traded needs to be a valid, positive number"]
    },
    profit: {
      type: Number, 
      required: true,
    },
    transactionCost: {
      type: Number,
      required: true,
      min: [0.0, "Needs to be a valid dollar value"], 
    }, 
    dateTraded: {
        type: Date, 
        required: true
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
tradeSchema.plugin(toJSON);
tradeSchema.plugin(paginate);


/**
 * @typedef Trade
 */
const Trade = mongoose.model('Trade', tradeSchema);

module.exports = Trade;