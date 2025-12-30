const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const courses = await db.collection('courses').find({}).toArray();
    
    console.log('Current courses and their details:');
    courses.forEach((course, index) => {
      console.log(`\n${index + 1}. Course: ${course.title}`);
      console.log(`   Code: ${course.code}`);
      console.log(`   Category: ${course.category}`);
      console.log(`   Current Image: ${course.image}`);
      console.log(`   Description: ${course.description?.substring(0, 80)}...`);
    });
    
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
