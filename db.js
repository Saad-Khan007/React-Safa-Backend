const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectToMongoose = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to Mongoose server.');
    } catch (err) {
        console.error('Unable to connect to Mongoose:', err);
    }
};


module.exports = connectToMongoose;
