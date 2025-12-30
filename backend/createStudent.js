const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Branch = require('./models/Branch');
require('dotenv').config();

const createStudentUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute');
    console.log('Connected to MongoDB');

    // Check if student user already exists
    const existingStudent = await User.findOne({ email: 'student@smartinstitute.co.in' });
    if (existingStudent) {
      console.log('Student user already exists');
      process.exit(0);
    }

    // Get the main branch
    const branch = await Branch.findOne({ code: 'MAIN' });
    if (!branch) {
      console.log('Main branch not found. Please run createAdmin.js first.');
      process.exit(1);
    }

    // Create student user
    const hashedPassword = await bcrypt.hash('student123', 12);
    
    const studentUser = new User({
      firstName: 'Test',
      lastName: 'Student',
      email: 'student@smartinstitute.co.in',
      password: hashedPassword,
      role: 'Student',
      phone: '+91-96017-49301',
      designation: 'Student',
      branch: branch._id,
      address: {
        street: '456 Student Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400002'
      },
      dateOfBirth: new Date('2000-01-01'),
      gender: 'Male',
      qualification: '12th Pass',
      isActive: true
    });

    await studentUser.save();
    console.log('Student user created successfully!');
    console.log('Email: student@smartinstitute.co.in');
    console.log('Password: student123');
    console.log('\nYou can now login as a student to test enrollment functionality.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating student user:', error);
    process.exit(1);
  }
};

createStudentUser();
