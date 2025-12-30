const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');

const createTestUserNoBranch = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute');
    console.log('Connected to MongoDB');

    // Check if test user without branch already exists
    const existingUser = await User.findOne({ email: 'testnouser@smartinstitute.co.in' });
    if (existingUser) {
      console.log('Test user without branch already exists');
      console.log('You can use this user to test edge cases:');
      console.log('Email: testnouser@smartinstitute.co.in');
      console.log('Password: password123');
      return;
    }

    // Create test user without branch (temporarily remove required constraint)
    const testUser = new User({
      firstName: 'Test',
      lastName: 'NoBranch',
      email: 'testnouser@smartinstitute.co.in',
      phone: '9876543211',
      password: await bcrypt.hash('password123', 10),
      role: 'Student',
      designation: 'Student',
      branch: null, // No branch assigned
      address: {
        street: '456 No Branch Street',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395010'
      },
      isActive: true
    });

    // Temporarily bypass validation
    testUser.markModified('branch');
    await testUser.save();
    
    console.log('✅ Test user without branch created successfully!');
    console.log('Login credentials for edge case testing:');
    console.log('Email: testnouser@smartinstitute.co.in');
    console.log('Password: password123');
    console.log('This user has no branch assigned - should show "Branch Not Assigned"');

  } catch (error) {
    console.error('Error creating test user without branch:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestUserNoBranch();
