const mongoose = require('mongoose');

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reliefchain', opts).then((mongoose) => {
      console.log('MongoDB connected');
      global.dbConnected = true;
      return mongoose;
    }).catch(err => {
      console.warn('MongoDB connection failed. Starting in offline mock-data mode.', err.message);
      global.dbConnected = false;
      return null;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;
