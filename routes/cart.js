const express = require('express')
const { body, validationResult } = require('express-validator')
const Cart = require('../models/Cart')
const Product = require('../models/Product')
const fetchUser = require('../middleware/login')
const router = express.Router()


// Route 1: Get cart of user by auth-token
// Path: /cart/getusercart
// Type: GET
router.get('/getcart', fetchUser, async (req, res) => {
    try {
        const cart = await Cart.find({ user: req.user.id })
        res.status(200).json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})

// Route 2: Create cart of user by auth-token
// Path: /cart/addcart
// Type: post
router.post('/addcart/:id', [
    body('quantity').isNumeric().notEmpty().withMessage('Quantity cannot be blank.'),
], fetchUser, async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const { quantity } = req.body;
        const cartItem = new Cart({
            user: req.user.id,
            product,
            quantity
        });
        const savedCartItem = await cartItem.save();
        res.status(200).json(savedCartItem);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Route 3: Delete a specific cart by cart id
// Path: /cart/deletecart
// Type: DELETE
router.delete('/deletecart/:id', fetchUser, async (req, res) => {
    try {
        const cartToDelete = await Cart.findById(req.params.id);
        if (!cartToDelete) {
            return res.status(404).send('Cart not found');
        }
        if (cartToDelete.user.toString() !== req.user.id) {
            return res.status(401).send('Unauthorized request to update cart'); //
        }
        await Cart.findByIdAndDelete(req.params.id)
        res.status(200).json({
            id: req.params.id,
            message: 'Cart deleted successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})

// Route 4: Delete all carts for a specific user
// Path: /cart/deleteallcart
// Type: DELETE
router.delete('/deleteallcarts', fetchUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const cartsToDelete = await Cart.find({ user: userId });
        if (!cartsToDelete || cartsToDelete.length === 0) {
            return res.status(404).send('No carts found for this user');
        }
        for (let cart of cartsToDelete) {
            if (cart.user.toString() !== userId) {
                return res.status(401).send('Unauthorized request to delete carts');
            }
        }
        await Cart.deleteMany({ user: userId });
        res.status(200).json({
            message: 'All carts deleted successfully for the user'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router