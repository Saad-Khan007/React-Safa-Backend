const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    category: String,
    desc: String,
    imgSrc: String,
    name: String,
    quantity: Number,
    rate: Number,
    sales: Number,
    type: String
});

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    quantity: {
        type: Number,
        required: true
    },
    product: {
        type: productSchema,
        required: true
    },
});
const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;