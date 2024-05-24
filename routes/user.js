const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const fetchUser = require('../middleware/login')
const { body, validationResult } = require('express-validator')
const router = express.Router()
const JWT_SECRET = 'safabackendjwtsecret'

// Route 1: Login by using email and password.
// Path: /user/login
// Type: POST
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password')
        .isStrongPassword({ minLength: 8, minUppercase: 1, minLowercase: 1, minSymbols: 1, minNumbers: 1 })
        .withMessage('Password must contain at least an uppercase, lowercase, symbol, number and have minimum 8 characters')
        .notEmpty()
        .withMessage('Password cannot be blank')
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Please try to login with correct credentials' });
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: 'Please try to login with correct credentials' });
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)
        res.status(200).json({ authToken });
    } catch (e) {
        console.error(e.message);
        res.status(500).send('Internal Server Error');
    }
})

// Route 2: Create a new user by using email, username and password
// Path: /user/signup
// Type: POST
router.post('/signup', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must contain at least an uppercase, lowercase, symbol, number and have minimum 8 characters').isStrongPassword({ minLength: 8, minUppercase: 1, minLowercase: 1, minSymbols: 1, minNumbers: 1 }),
    body('username').isString({ min: 8 }),

], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const isUserExistWithSameEmail = await User.findOne({ email: req.body.email });
    if (isUserExistWithSameEmail) {
        return res.status(200).json({ errors: 'User with same email already exists' })
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password, salt)
    User.create({
        username: req.body.username,
        password: secPass,
        email: req.body.email
    }).then((user) => {
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)
        res.status(200).json({ authToken });
    }).catch((err) => {
        res.status(400).json({ error: err.message });
        console.error(err);
    });
})

// Route 3: Get user by jwt token
// Path: /user/getuser
// Type: POST
router.post('/getuser', fetchUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
})
module.exports = router