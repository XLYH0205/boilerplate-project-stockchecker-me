'use strict';
const { Stock } = require('../models/stock.model')

const getStockFromDB = async (stock, ip, isLike) => {
  var stockData = await Stock.findOne({ stock: stock });

  if (stockData && isLike && !stockData.likes.includes(ip)) {
    console.log("Found, adding like...");
    stockData = await Stock.findOneAndUpdate({ stock: stock }, { $push: { likes: ip } }, { new: true });
  }

  if (!stockData) {
    console.log("Not found, creating one...");
    stockData = await addStockToDB(stock, ip, isLike)
  }

  return stockData;
}

const addStockToDB = async (stock, ip, isLike) => {
  const newStock = new Stock({ stock: stock, likes: isLike ? [ip] : [] });
  const res = await newStock.save();
  return res
}

const getPriceByStock = async (stock) => {
  const res = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`).then(res => res.json());

  if (res == "Invalid symbol") {
    console.log("Invalid symbol, return 0");
    return { status: false }
  }
  return { status: true, price: res.latestPrice }
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      console.log(req.query);

      const requestIP = req.ip

      // method1 (Get single price and total likes)
      if (typeof req.query.stock === 'string') {
        const stock = req.query.stock
        const { status, price } = await getPriceByStock(stock);

        if (!status) {
          res.json(
            {
              "stockData": {
                "error": "invalid symbol",
                "likes": 0
              }
            }
          );
          return
        }

        // get stock
        const stockData = await getStockFromDB(stock, requestIP, req.query.like === 'true');

        res.json(
          {
            "stockData": {
              "stock": stock,
              "price": price,
              "likes": stockData.likes.length
            }
          }
        );
      }
      // method2 (Compare and get relative likes)
      else {
        const stock1 = req.query.stock[0]
        const stock2 = req.query.stock[1]
        const { status: status1, price: price1 } = await getPriceByStock(stock1);
        const { status: status2, price: price2 } = await getPriceByStock(stock2);        
        
        var likes1
        var likes2
        var result1 = {}; var result2 = {}

        if (!status1) {
          likes1 = 0
          result1["error"] = "invalid symbol"
        } else {
          const stockData = await getStockFromDB(stock1, requestIP, req.query.like === 'true');
          likes1 = stockData.likes.length
          result1["stock"] = stock1
          result1["price"] = price1
        }

        if (!status2) {
          likes2 = 0
          result2["error"] = "invalid symbol"
        }
        else {
          const stockData = await getStockFromDB(stock2, requestIP, req.query.like === 'true');
          likes2 = stockData.likes.length
          result2["stock"] = stock2
          result2["price"] = price2
        }

        result1["rel_likes"] = likes1 - likes2
        result2["rel_likes"] = likes2 - likes1

        res.json(
          {
            "stockData": [result1, result2]
          }
        );

      }
    });

};
