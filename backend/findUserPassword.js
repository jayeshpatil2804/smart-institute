const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database (without deprecated options)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute');

const User = require('./models/User');

// Find user by email and show their password (for testing purposes)
const findUserPassword = async () => {
  try {
    const user = await User.findOne({ email: 'testuser@smartinstitute.co.in' });
    
    if (user) {
      console.log('User Found:');
      console.log('Email:', user.email);
      console.log('Password:', user.password);
      console.log('First Name:', user.firstName);
      console.log('Last Name:', user.lastName);
      console.log('Role:', user.role);
      console.log('Branch:', user.branch);
    } else {
      console.log('User not found with email: testuser@smartinstitute.co.in');
    }
  } catch (error) {
    console.error('Error finding user:', error);
  } finally {
    mongoose.connection.close();
  }
};

findUserPassword();
