const symbols = require("../config/stocks");
// const { symbol } = require('joi');
require('dotenv').config();
   // import * as tf from "@tensorflow/tfjs";
const tf = require('@tensorflow/tfjs');
const request = require('request');



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
        rsiData = data['Technical Analysis: RSI'];
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
        let smaData = data['Technical Analysis: SMA'];
        let date = Object.keys(smaData)[0];
        smaData = smaData[date]["SMA"];
        resolve(smaData);
        }
    });
    })
    
}

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
  

async function main(){
    const ML_model = await tfft.loadGraphModel(MODEL_URL);

    for(symbol of symbols){
        let rsiData = await getRSI("MAA");
        let emaData = await getEMA("MAA");
        let smaData = await getSMA("MAA");
        console.log(rsiData);
        console.log(emaData);
        console.log(smaData);

        rsiData = preprocessRSI(rsiData);
        let data = preprocessEMAandSMA(emaData,smaData);
        emaData = data[0];
        smaData = data[1];
        console.log(ML_model.summary());
        const predictior = ML_model.execute(rsiData, emaData, smaData);
    
        console.log("The prediction is: " + predictior);


    }
        //feed to model normalized data  

}

module.exports = {
    main,
  };
