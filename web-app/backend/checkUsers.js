const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    // Get all users
    const users = await User.find({});
    
    for (const user of users) {
      console.log('\n===================');
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Password (hashed):', user.password);
      console.log('Password starts with $2:', user.password.startsWith('$2'));
      
      // Test password
      const testPassword = 'password123';
      const isMatch = await user.comparePassword(testPassword);
      console.log(`Testing "${testPassword}":`, isMatch);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
