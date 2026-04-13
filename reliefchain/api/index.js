const app = require('../backend/src/app');
const connectDB = require('../backend/src/config/db');

// Ensure DB is connected for serverless invocations
connectDB();

module.exports = app;
