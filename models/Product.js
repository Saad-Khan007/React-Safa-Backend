const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    category: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    imgSrc: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    sales: {
        type: Number,
        required: true
    }
});
const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;