const { default: mongoose } = require("mongoose");

const stockSchema = mongoose.Schema({
    stock: {
        type: String,
        required: true
    },
    likes: {
        type: [String],
        default: []
    }
})

module.exports.Stock = mongoose.model('Stock', stockSchema)