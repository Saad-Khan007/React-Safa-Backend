const connectToMongo = require('./db');
const express = require('express')
const app = express()
const port = 5000
const cors = require('cors');

connectToMongo();

// For getting the body of a request
app.use(express.json())
app.use(cors())

app.use('/user', require('./routes/user'))
app.use('/cart', require('./routes/cart'))
app.use('/product', require('./routes/product'))
app.use('/order', require('./routes/order'))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})