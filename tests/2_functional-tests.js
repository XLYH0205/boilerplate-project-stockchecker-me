const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    suite("Tasks:", function () {
        test("one stock, no like", (done) => {
            chai
                .request(server)
                .get("/api/stock-prices/")
                .set("content-type", "application/json")
                .query({ stock: "GOOG" })
                .end((err, res) => {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.stockData.stock, "GOOG")
                    assert.exists(res.body.stockData.price, "GOOG has price")
                    done()
                })
        });
        test("one stock, like", (done) => {
            chai
                .request(server)
                .get("/api/stock-prices/")
                .set("content-type", "application/json")
                .query({ stock: "BOE", like: true })
                .end((err, res) => {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.stockData.stock, "BOE")
                    assert.equal(res.body.stockData.likes, 1)
                    assert.exists(res.body.stockData.price, "BOE has price")
                    done()
                })
        });
        test("second time: one stock, like", (done) => {
            chai
                .request(server)
                .get("/api/stock-prices/")
                .set("content-type", "application/json")
                .query({ stock: "BOE", like: true })
                .end((err, res) => {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.stockData.stock, "BOE")
                    assert.equal(res.body.stockData.likes, 1)
                    assert.exists(res.body.stockData.price, "BOE has price")
                    done()
                })
        });
        test("2 stock. no like", (done) => {
            chai
                .request(server)
                .get("/api/stock-prices/")
                .set("content-type", "application/json")
                .query({ stock: ["MFST", "TSLA"] })
                .end((err, res) => {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.stockData[0].stock, "MFST")
                    assert.equal(res.body.stockData[1].stock, "TSLA")
                    assert.exists(res.body.stockData[0].price, "MFST has price")
                    assert.exists(res.body.stockData[1].price, "TSLA has price")
                    done()
                })
        });
        test("2 stock. like", (done) => {
            chai
                .request(server)
                .get("/api/stock-prices/")
                .set("content-type", "application/json")
                .query({ stock: ["MFST", "TSLA"], like: true })
                .end((err, res) => {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.stockData[0].stock, "MFST")
                    assert.equal(res.body.stockData[1].stock, "TSLA")
                    assert.exists(res.body.stockData[0].price, "MFST has price")
                    assert.exists(res.body.stockData[1].price, "TSLA has price")
                    assert.exists(res.body.stockData[0].rel_likes, "has rel_likes")
                    assert.exists(res.body.stockData[1].rel_likes, "has rel_likes")
                    done()
                })
        });
    })
});
