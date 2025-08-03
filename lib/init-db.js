import connectDB from "./db.js";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

const initDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Check if admin user exists
    const existingUser = await User.findOne({ username: 'admin' });
    
    if (!existingUser) {
      // Create default admin user
      const adminUser = new User({
        username: 'admin',
        password: 'password'
      });
      
      await adminUser.save();
      console.log('✅ Default admin user created successfully');
      console.log('Username: admin');
      console.log('Password: password');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    console.log('Database initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initDatabase(); 