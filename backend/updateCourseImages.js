const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Course-specific image mappings based on course content
    const courseImageMappings = {
      // Accounting Courses
      'CAT_SMART': 'https://images.unsplash.com/photo-1554224154-260325c0538c?w=400&h=300&fit=crop&crop=center',
      'CAT': 'https://images.unsplash.com/photo-1554224154-260325c0538c?w=400&h=300&fit=crop&crop=center',
      'FEM': 'https://images.unsplash.com/photo-1554224154-260325c0538c?w=400&h=300&fit=crop&crop=center',
      'TALLY_ERP9': 'https://images.unsplash.com/photo-1554224154-260325c0538c?w=400&h=300&fit=crop&crop=center',
      
      // Designing Courses
      'CTD': 'https://images.unsplash.com/photo-1522735338363-c10fff3093b6?w=400&h=300&fit=crop&crop=center',
      'CDP': 'https://images.unsplash.com/photo-1563089145-b4b96ba4e0cd?w=400&h=300&fit=crop&crop=center',
      'DTP': 'https://images.unsplash.com/photo-1563207153-db16a4efc8c0?w=400&h=300&fit=crop&crop=center',
      'TD': 'https://images.unsplash.com/photo-1522735338363-c10fff3093b6?w=400&h=300&fit=crop&crop=center',
      'CDM': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&crop=center',
      
      // College Students Courses
      'DTDA': 'https://images.unsplash.com/photo-1522735338363-c10fff3093b6?w=400&h=300&fit=crop&crop=center',
      'CABT': 'https://images.unsplash.com/photo-1554224154-260325c0538c?w=400&h=300&fit=crop&crop=center',
      
      // IT For Beginners
      'MC': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop&crop=center',
      'CCA': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop&crop=center',
      'KP': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop&crop=center',
      'CAS': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop&crop=center',
      'BCC': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop&crop=center',
      
      // Diploma & Advanced Courses
      'ADCA': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop&crop=center',
      
      // Global IT Certifications
      'CAWD': 'https://images.unsplash.com/photo-1467232004584-a241e860d849?w=400&h=300&fit=crop&crop=center',
      'DSM': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&crop=center',
      'CASD': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop&crop=center',
      'PGDCA': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop&crop=center'
    };
    
    console.log('Updating course images with relevant content-specific images...\n');
    
    let updatedCount = 0;
    
    for (const [courseCode, newImageUrl] of Object.entries(courseImageMappings)) {
      try {
        const result = await db.collection('courses').updateOne(
          { code: courseCode },
          { $set: { image: newImageUrl } }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`✅ Updated ${courseCode}: ${newImageUrl}`);
          updatedCount++;
        } else {
          console.log(`⚠️  No changes for ${courseCode} (course not found or already updated)`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${courseCode}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} course images!`);
    
    // Verify the updates
    console.log('\nVerifying updated course images:');
    const courses = await db.collection('courses').find({}).toArray();
    
    courses.forEach((course, index) => {
      console.log(`\n${index + 1}. ${course.title}`);
      console.log(`   Code: ${course.code}`);
      console.log(`   New Image: ${course.image}`);
    });
    
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
