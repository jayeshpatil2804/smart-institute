const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Branch = require('./models/Branch');

const createTestUserDeletedBranch = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute');
    console.log('Connected to MongoDB');

    // Create a fake branch ID that doesn't exist
    const fakeBranchId = new mongoose.Types.ObjectId();
    
    // Check if test user with deleted branch already exists
    const existingUser = await User.findOne({ email: 'testdeletedbranch@smartinstitute.co.in' });
    if (existingUser) {
      console.log('Test user with deleted branch already exists');
      console.log('You can use this user to test edge cases:');
      console.log('Email: testdeletedbranch@smartinstitute.co.in');
      console.log('Password: password123');
      return;
    }

    // Create test user with non-existent branch ID
    const testUser = new User({
      firstName: 'Test',
      lastName: 'DeletedBranch',
      email: 'testdeletedbranch@smartinstitute.co.in',
      phone: '9876543212',
      password: await bcrypt.hash('password123', 10),
      role: 'Student',
      designation: 'Student',
      branch: fakeBranchId, // Non-existent branch ID
      address: {
        street: '789 Deleted Branch Street',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395010'
      },
      isActive: true
    });

    await testUser.save();
    
    console.log('✅ Test user with deleted branch created successfully!');
    console.log('Login credentials for edge case testing:');
    console.log('Email: testdeletedbranch@smartinstitute.co.in');
    console.log('Password: password123');
    console.log('This user has a non-existent branch ID - should show "Branch Not Assigned"');

  } catch (error) {
    console.error('Error creating test user with deleted branch:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestUserDeletedBranch();
