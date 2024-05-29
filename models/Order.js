const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    category: String,
    desc: String,
    imgSrc: String,
    name: String,
    quantity: Number,
    rate: Number,
    sales: Number,
});

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    orders: {
        type: [productSchema],
        required: true
    },
});
const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;