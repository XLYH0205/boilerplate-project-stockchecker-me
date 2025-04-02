const mongoose = require('mongoose')
require('dotenv').config()

module.exports.connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB)
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.log("Error connecting to DB", error);
        process.exit(1);                
    }
}