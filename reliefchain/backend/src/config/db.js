const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reliefchain');
    console.log('MongoDB connected');
    global.dbConnected = true;
  } catch (err) {
    console.warn('MongoDB connection failed. Starting in offline mock-data mode.', err.message);
    global.dbConnected = false;
  }
};
module.exports = connectDB;
