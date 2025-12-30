const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const mainBranchId = '69523c90367a3755d3ea96ac';
    
    // Check users collection for branch references
    console.log('Checking users collection...');
    const users = await db.collection('users').find({ branch: mainBranchId }).toArray();
    console.log(`Found ${users.length} users referencing Main Branch:`);
    users.forEach(user => {
      console.log(`- User: ${user.name} (${user.email})`);
    });
    
    // Check courses collection for branch references
    console.log('\nChecking courses collection...');
    const courses = await db.collection('courses').find({ branch: mainBranchId }).toArray();
    console.log(`Found ${courses.length} courses referencing Main Branch:`);
    courses.forEach(course => {
      console.log(`- Course: ${course.name} (${course.code})`);
    });
    
    // Check enrollments collection for branch references
    console.log('\nChecking enrollments collection...');
    const enrollments = await db.collection('enrollments').find({ branch: mainBranchId }).toArray();
    console.log(`Found ${enrollments.length} enrollments referencing Main Branch:`);
    enrollments.forEach(enrollment => {
      console.log(`- Enrollment ID: ${enrollment._id}`);
    });
    
    // Check any other collections that might reference branches
    console.log('\nChecking other collections...');
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      const collectionName = collection.name;
      if (['users', 'courses', 'enrollments', 'branches'].includes(collectionName)) continue;
      
      try {
        const docs = await db.collection(collectionName).find({ branch: mainBranchId }).toArray();
        if (docs.length > 0) {
          console.log(`Found ${docs.length} documents in ${collectionName} referencing Main Branch`);
        }
      } catch (err) {
        // Skip collections that don't have branch field
      }
    }
    
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
