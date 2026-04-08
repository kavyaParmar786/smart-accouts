// MongoDB connection - serverless-safe with connection caching
const mongoose = require('mongoose');

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    }).then((m) => {
      console.log('✅ MongoDB connected');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
