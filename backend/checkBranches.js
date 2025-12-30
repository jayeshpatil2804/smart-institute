const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get Branch collection
    const db = mongoose.connection.db;
    const branches = await db.collection('branches').find({}).toArray();
    
    console.log('Current branches:');
    branches.forEach(branch => {
      console.log('ID:', branch._id);
      console.log('Name:', branch.name);
      console.log('Address:', branch.address);
      console.log('Phone:', branch.phone);
      console.log('Mobile:', branch.mobile);
      console.log('---');
    });
    
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
