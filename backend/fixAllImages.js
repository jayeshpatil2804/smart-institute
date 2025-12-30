const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Reliable, working image URLs that are guaranteed to be accessible
    const reliableImageMappings = {
      // Accounting Courses - Professional business/finance images
      'CAT_SMART': 'https://picsum.photos/seed/accounting-smart/400/300.jpg',
      'CAT': 'https://picsum.photos/seed/accounting-training/400/300.jpg',
      'FEM': 'https://picsum.photos/seed/financial-management/400/300.jpg',
      'TALLY_ERP9': 'https://picsum.photos/seed/tally-erp9/400/300.jpg',
      
      // Designing Courses - Creative/design images
      'CTD': 'https://picsum.photos/seed/textile-design/400/300.jpg',
      'CDP': 'https://picsum.photos/seed/digital-printing/400/300.jpg',
      'DTP': 'https://picsum.photos/seed/desktop-publishing/400/300.jpg',
      'TD': 'https://picsum.photos/seed/textile-designing/400/300.jpg',
      'CDM': 'https://picsum.photos/seed/digital-marketing/400/300.jpg',
      
      // College Students Courses
      'DTDA': 'https://picsum.photos/seed/textile-accounting/400/300.jpg',
      'CABT': 'https://picsum.photos/seed/computer-tally/400/300.jpg',
      
      // IT For Beginners - Computer/technology images
      'MC': 'https://picsum.photos/seed/my-computer/400/300.jpg',
      'CCA': 'https://picsum.photos/seed/computer-application/400/300.jpg',
      'KP': 'https://picsum.photos/seed/kids-programming/400/300.jpg',
      'CAS': 'https://picsum.photos/seed/application-software/400/300.jpg',
      'BCC': 'https://picsum.photos/seed/computer-concept/400/300.jpg',
      
      // Diploma & Advanced Courses
      'ADCA': 'https://picsum.photos/seed/advance-diploma/400/300.jpg',
      
      // Global IT Certifications - Professional IT images
      'CAWD': 'https://picsum.photos/seed/web-designing/400/300.jpg',
      'DSM': 'https://picsum.photos/seed/software-management/400/300.jpg',
      'CASD': 'https://picsum.photos/seed/software-development/400/300.jpg',
      'PGDCA': 'https://picsum.photos/seed/pgdca-course/400/300.jpg'
    };
    
    console.log('Updating all course images with reliable, working URLs...\n');
    
    let updatedCount = 0;
    
    for (const [courseCode, newImageUrl] of Object.entries(reliableImageMappings)) {
      try {
        const result = await db.collection('courses').updateOne(
          { code: courseCode },
          { $set: { image: newImageUrl } }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`✅ Updated ${courseCode}: ${newImageUrl}`);
          updatedCount++;
        } else {
          console.log(`⚠️  No changes for ${courseCode}`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${courseCode}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} course images with reliable URLs!`);
    
    // Verify the updates
    console.log('\nVerifying updated course images:');
    const courses = await db.collection('courses').find({}).toArray();
    
    courses.forEach((course, index) => {
      console.log(`\n${index + 1}. ${course.title}`);
      console.log(`   Code: ${course.code}`);
      console.log(`   Image: ${course.image}`);
    });
    
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
