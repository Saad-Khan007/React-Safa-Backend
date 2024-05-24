const JWT_SECRET = 'safabackendjwtsecret'
const jwt = require('jsonwebtoken')

const fetchUser = (req, res, next) => {
    // get the user from jwt token and id to request object

    const token = req.header('auth-token')
    if (!token) {
        res.status(401).json({ error: 'Invalid token' })
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' })
    }
}

module.exports = fetchUser