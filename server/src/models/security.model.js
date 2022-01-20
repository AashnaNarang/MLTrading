const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const securitySchema = mongoose.Schema(
  {
    portfolio: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Portfolio",
    },
    securityName: {
      type: String, 
      required: true,
    },
    securityCode: {
      type: String, 
      required: true
    },
    avgPrice: {
      type: Number, 
      required: true, 
      min: [0.0, "Average price needs to be a valid, positive number"]
    },
    shares: {
      type: Number, 
      required: true,
      min: [0.0, "Number of shares needs to be a valid, positive amount"]
    },
    totalValue: {
      type: Number,
      required: true,
      min: [0.0, "Total value needs to be a valid dollar value"], 
    }, 
    lastUpdated: {
      type: Date, 
      required: true
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
securitySchema.plugin(toJSON);
securitySchema.plugin(paginate);


/**
 * @typedef Security
 */
const Security = mongoose.model('Security', securitySchema);

module.exports = Security;