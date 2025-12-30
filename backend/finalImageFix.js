const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Use reliable image URLs with different seeds and direct format
    const finalImageMappings = {
      // Accounting Courses
      'CAT_SMART': 'https://picsum.photos/400/300?random=1',
      'CAT': 'https://picsum.photos/400/300?random=2',
      'FEM': 'https://picsum.photos/400/300?random=3',
      'TALLY_ERP9': 'https://picsum.photos/400/300?random=4',
      
      // Designing Courses
      'CTD': 'https://picsum.photos/400/300?random=5',
      'CDP': 'https://picsum.photos/400/300?random=6',
      'DTP': 'https://picsum.photos/400/300?random=7',
      'TD': 'https://picsum.photos/400/300?random=8',
      'CDM': 'https://picsum.photos/400/300?random=9',
      
      // College Students Courses
      'DTDA': 'https://picsum.photos/400/300?random=10',
      'CABT': 'https://picsum.photos/400/300?random=11',
      
      // IT For Beginners
      'MC': 'https://picsum.photos/400/300?random=12',
      'CCA': 'https://picsum.photos/400/300?random=13',
      'KP': 'https://picsum.photos/400/300?random=14',
      'CAS': 'https://picsum.photos/400/300?random=15',
      'BCC': 'https://picsum.photos/400/300?random=16',
      
      // Diploma & Advanced Courses
      'ADCA': 'https://picsum.photos/400/300?random=17',
      
      // Global IT Certifications
      'CAWD': 'https://picsum.photos/400/300?random=18',
      'DSM': 'https://picsum.photos/400/300?random=19',
      'CASD': 'https://picsum.photos/400/300?random=20',
      'PGDCA': 'https://picsum.photos/400/300?random=21'
    };
    
    console.log('Updating course images with reliable direct URLs...\n');
    
    let updatedCount = 0;
    
    for (const [courseCode, newImageUrl] of Object.entries(finalImageMappings)) {
      try {
        const result = await db.collection('courses').updateOne(
          { code: courseCode },
          { $set: { image: newImageUrl } }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`✅ Updated ${courseCode}: ${newImageUrl}`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${courseCode}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} course images!`);
    
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
