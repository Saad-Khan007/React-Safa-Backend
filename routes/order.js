const express = require('express')
const { body, validationResult } = require('express-validator')
const Order = require('../models/Order')
const Cart = require('../models/Cart')
const Product = require('../models/Product')
const fetchUser = require('../middleware/login')
const router = express.Router()


// Route 1: Get order of user by auth-token
// Path: /order/getuserorder
// Type: GET
router.get('/getorder', fetchUser, async (req, res) => {
    try {
        const order = await Order.find({ user: req.user.id })
        res.status(200).json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})

// Route 2: Create order of user by auth-token
// Path: /order/addorder
// Type: post
router.post('/addorder', [
    body('contact').isNumeric().notEmpty().withMessage('Contact cannot be blank.'),
    body('price').isNumeric().notEmpty().withMessage('Price cannot be blank.'),
    body('email', 'Enter a valid email').isEmail().notEmpty().withMessage('Email cannot be blank.'),
    body('address').isString().notEmpty().withMessage('Address cannot be blank.'),
], fetchUser, async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const carts = await Cart.find({ user: req.user.id });
        if (!carts) {
            return res.status(404).json({ error: 'Carts not found' });
        }

        const products = [];
        carts.map(cart => {
            cart.product['quantity'] = cart.quantity;
            products.push(cart.product);
        })
        const { contact, email, address, price } = req.body;
        const orderItem = new Order({
            user: req.user.id,
            contact,
            email,
            address,
            price,
            status: 'In Progress',
            orders: products
        });
        const savedOrderItem = await orderItem.save();
        res.status(200).json(savedOrderItem);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Route 3: Delete a specific order by order id
// Path: /order/deleteorder
// Type: DELETE
router.delete('/deleteorder/:id', fetchUser, async (req, res) => {
    try {
        const orderToDelete = await Order.findById(req.params.id);
        if (!orderToDelete) {
            return res.status(404).send('Order not found');
        }
        if (orderToDelete.user.toString() !== req.user.id) {
            return res.status(401).send('Unauthorized request to update order'); //
        }
        await Order.findByIdAndDelete(req.params.id)
        res.status(200).json({
            id: req.params.id,
            message: 'Order deleted successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})

// Route 4: Delete all orders for a specific user
// Path: /order/deleteallorder
// Type: DELETE
router.delete('/deleteallorders', fetchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const ordersToDelete = await Order.find({ user: userId });
        if (!ordersToDelete || ordersToDelete.length === 0) {
            return res.status(404).send('No orders found for this user');
        }
        for (let order of ordersToDelete) {
            if (order.user.toString() !== userId) {
                return res.status(401).send('Unauthorized request to delete orders');
            }
        }
        await Order.deleteMany({ user: userId });
        res.status(200).json({
            message: 'All orders deleted successfully for the user'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router