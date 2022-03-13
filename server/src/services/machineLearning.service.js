const { symbols } = require('../config/stocks');
require('dotenv').config();
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
const request = require('request');
// Load the binding
const tf = require('@tensorflow/tfjs-node');


// https://blog.tensorflow.org/2020/01/run-tensorflow-savedmodel-in-nodejs-directly-without-conversion.html


function getRSI(symbol){
    return new Promise(function (resolve, reject){
    let url = 'https://www.alphavantage.co/query?function=RSI&symbol='+symbol+'&interval=weekly&time_period=10&series_type=close&apikey='+process.env.API_KEY;
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
        let rsiData = data['Technical Analysis: RSI'];
        let date = Object.keys(rsiData)[0];
        rsiData = rsiData[date]["RSI"];
        resolve(rsiData);
        }
    });
    })
    
}


function getEMA(symbol){
    return new Promise(function (resolve, reject){
    let url = 'https://www.alphavantage.co/query?function=EMA&symbol='+symbol+'&interval=weekly&time_period=10&series_type=close&apikey='+process.env.API_KEY;

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
        let emaData = data['Technical Analysis: EMA'];
        let date = Object.keys(emaData)[0];
        emaData = emaData[date]["EMA"];
        resolve(emaData);
        }
    });
    })
    
}

function getSMA(symbol){
    return new Promise(function (resolve, reject){
    let url = 'https://www.alphavantage.co/query?function=SMA&symbol='+symbol+'&interval=daily&time_period=20&series_type=close&apikey='+process.env.API_KEY;;
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
        let smaData = data['Technical Analysis: SMA'];
        let date = Object.keys(smaData)[0];
        smaData = smaData[date]["SMA"];
        resolve(smaData);
        }
    });
    })
    
}

//check if the request is empty or not
function isEmpty(empty) {
    return Object.keys(empty).length === 0 && empty.constructor === Object;
}

// preprocess the RSI based on our documentation
function preprocessRSI(rsiData){
    if(rsiData > 70){
        rsiData = 1;
    }else if(rsiData >= 50){
        rsiData = 2/3;
    }else if(rsiData >=30){
        rsiData = 1/3;
    }else{
        rsiData = 0;
    }
    return rsiData;
}

//preprocessing the ema and sma based on our documentation
function preprocessEMAandSMA(emaData, smaData){
    if(smaData >= emaData){
        smaData = 1;
        emaData = 0;
    }
    else{
        smaData = 0;
        emaData = 1;
    }
    return [emaData, smaData];
}

async function run(){

    const path = 'file:///Users/aelna/Documents/MachineLearning/MLTrading/server/src/services/model/model.json'
    const model1 = await tf.loadLayersModel(path);

    const buy = [];
    const sell = [];

    for(element of symbols){
        console.log("machineLearnign serivce : " + element);
        await sleep(1000); // sleep for 1 seconds
        //get technical indicator per stock
        let rsiData = await getRSI(element);
        let emaData = await getEMA(element);
        let smaData = await getSMA(element);

        //preprocess the data
        let data = preprocessEMAandSMA(emaData,smaData);
        rsiData = preprocessRSI(rsiData);
        emaData = data[0];
        smaData = data[1];
        //create an array format to pass through the model
        const arr = [emaData, smaData, rsiData];    

        //predict - results would be between 0 and 1, so round to nearest
        const outputArray = model1.predict(tf.tensor([arr]));
        const prediction = Math.round(outputArray.dataSync());

        //for testing
        console.log("The symbol is "+ element+ "and we " + prediction);

        //One is buy, 0 is sell
        if(prediction == 1){
            buy.push(element);
        }else{
            sell.push(element);
        }
    }
    console.log("Sell these:" + sell.toString());
    console.log("Buy these: " + buy.toString());
    return  {buy , sell};
}

run();

module.exports = {
    run,
  };
