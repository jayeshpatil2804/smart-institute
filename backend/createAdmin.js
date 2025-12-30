const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Branch = require('./models/Branch');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute');
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@smartinstitute.co.in' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create or get a default branch
    let branch = await Branch.findOne({ code: 'MAIN' });
    if (!branch) {
      branch = new Branch({
        name: 'Main Branch',
        code: 'MAIN',
        address: {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        contact: {
          phone: '+91-96017-49300',
          email: 'main@smartinstitute.co.in'
        },
        isActive: true
      });
      await branch.save();
      console.log('Default branch created');
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@smartinstitute.co.in',
      password: hashedPassword,
      role: 'Admin',
      phone: '+91-96017-49300',
      designation: 'System Administrator',
      branch: branch._id,
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@smartinstitute.co.in');
    console.log('Password: admin123');
    console.log('\nYou can now login to the admin panel with these credentials.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
