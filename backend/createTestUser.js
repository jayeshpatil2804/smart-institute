const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Branch = require('./models/Branch');

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute');
    console.log('Connected to MongoDB');

    // Get the Godadara branch
    const godadaraBranch = await Branch.findOne({ name: 'Godadara' });
    if (!godadaraBranch) {
      console.error('Godadara branch not found');
      return;
    }

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'testuser@smartinstitute.co.in' });
    if (existingUser) {
      console.log('Test user already exists');
      console.log(`User: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`Branch: ${existingUser.branch}`);
      console.log('You can use this user to test the navbar:');
      console.log('Email: testuser@smartinstitute.co.in');
      console.log('Password: password123');
      return;
    }

    // Create test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@smartinstitute.co.in',
      phone: '9876543210',
      password: hashedPassword,
      role: 'Student',
      designation: 'Student',
      branch: godadaraBranch._id,
      address: {
        street: '123 Test Street',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395010'
      },
      isActive: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Login credentials:');
    console.log('Email: testuser@smartinstitute.co.in');
    console.log('Password: password123');
    console.log(`Assigned to: ${godadaraBranch.name} Branch`);

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestUser();
