import mongoose from 'mongoose';

// Global variable to store the connection
let cachedConnection = null;

const connectDB = async () => {
  // If we already have a connection, return it
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const options = {
      bufferCommands: false, // Disable mongoose buffering
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // For serverless environments, we need different connection handling
    if (process.env.NODE_ENV === 'production') {
      options.maxPoolSize = 1; // Limit connections for serverless
      options.serverSelectionTimeoutMS = 5000; // Faster timeout
      options.socketTimeoutMS = 45000; // Socket timeout
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/seo-generator', options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Cache the connection
    cachedConnection = conn;
    
    // Handle connection events
    conn.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      cachedConnection = null;
    });

    conn.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      cachedConnection = null;
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    cachedConnection = null;
    throw error;
  }
};

export default connectDB; 