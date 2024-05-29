const express = require('express')
const Product = require('../models/Product')
const fetchUser = require('../middleware/login')
const { body, validationResult } = require('express-validator')
const router = express.Router()


// Route 1: Get all products
// Path: /product/getallproduct
// Type: GET
router.get('/getallproducts', async (req, res) => {
    try {
        const product = await Product.find().select('-user -__v');
        res.status(200).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})

// Route 2: Get product of user by auth-token
// Path: /product/getproduct
// Type: GET
router.get('/getproduct', fetchUser, async (req, res) => {
    try {
        const product = await Product.find({ user: req.user.id })
        res.status(200).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})

// Route 3: Create product of user by auth-token
// Path: /product/addproduct
// Type: POST
router.post('/addproduct', fetchUser, [
    body('category').isString().notEmpty().withMessage('Category cannot be blank'),
    body('desc').isString().notEmpty().withMessage('Description cannot be blank'),
    body('imgSrc').isString().notEmpty().withMessage('Image Source cannot be blank'),
    body('name').isString().notEmpty().withMessage('Name cannot be blank'),
    body('rate').isNumeric().notEmpty().withMessage('Rate cannot be blank'),
    body('sales').isNumeric().notEmpty().withMessage('Sales cannot be blank'),
], async (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { category, desc, imgSrc, name, rate, sales } = req.body;
        const product = new Product({
            user: req.user.id,
            category,
            desc,
            imgSrc,
            name,
            rate,
            sales
        })
        const saveProduct = await product.save();
        res.status(200).json(saveProduct);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})

// Route 4: Delete a specific product by product id
// Path: /product/deleteproduct
// Type: DELETE
router.delete('/deleteproduct/:id', fetchUser, async (req, res) => {
    try {
        const productToDelete = await Product.findById(req.params.id);
        if (!productToDelete) {
            return res.status(404).send('Product not found');
        }
        if (productToDelete.user.toString() !== req.user.id) {
            return res.status(401).send('Unauthorized request to update product'); //
        }
        await Product.findByIdAndDelete(req.params.id)
        res.status(200).json({
            id: req.params.id,
            message: 'Product deleted successfully'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})

module.exports = router