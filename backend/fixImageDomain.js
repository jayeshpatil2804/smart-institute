const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Use dummyimage.com which is more reliable
    const workingImageMappings = {
      // Accounting Courses - Blue theme
      'CAT_SMART': 'https://dummyimage.com/400x300/2563eb/ffffff&text=Accounting+Smart',
      'CAT': 'https://dummyimage.com/400x300/2563eb/ffffff&text=Accounting+Training',
      'FEM': 'https://dummyimage.com/400x300/2563eb/ffffff&text=Financial+Management',
      'TALLY_ERP9': 'https://dummyimage.com/400x300/2563eb/ffffff&text=Tally+ERP9',
      
      // Designing Courses - Red theme
      'CTD': 'https://dummyimage.com/400x300/dc2626/ffffff&text=Textile+Design',
      'CDP': 'https://dummyimage.com/400x300/dc2626/ffffff&text=Digital+Printing',
      'DTP': 'https://dummyimage.com/400x300/dc2626/ffffff&text=Desktop+Publishing',
      'TD': 'https://dummyimage.com/400x300/dc2626/ffffff&text=Textile+Designing',
      'CDM': 'https://dummyimage.com/400x300/dc2626/ffffff&text=Digital+Marketing',
      
      // College Students Courses - Purple theme
      'DTDA': 'https://dummyimage.com/400x300/7c3aed/ffffff&text=Diploma+Textile+Accounting',
      'CABT': 'https://dummyimage.com/400x300/7c3aed/ffffff&text=Computer+Basic+Tally',
      
      // IT For Beginners - Teal theme
      'MC': 'https://dummyimage.com/400x300/059669/ffffff&text=My+Computer',
      'CCA': 'https://dummyimage.com/400x300/059669/ffffff&text=Computer+Application',
      'KP': 'https://dummyimage.com/400x300/059669/ffffff&text=Kids+Programming',
      'CAS': 'https://dummyimage.com/400x300/059669/ffffff&text=Application+Software',
      'BCC': 'https://dummyimage.com/400x300/059669/ffffff&text=Computer+Concept',
      
      // Diploma & Advanced Courses - Orange theme
      'ADCA': 'https://dummyimage.com/400x300/ea580c/ffffff&text=ADCA',
      
      // Global IT Certifications - Green theme
      'CAWD': 'https://dummyimage.com/400x300/0d9488/ffffff&text=Web+Designing',
      'DSM': 'https://dummyimage.com/400x300/0d9488/ffffff&text=Software+Management',
      'CASD': 'https://dummyimage.com/400x300/0d9488/ffffff&text=Software+Development',
      'PGDCA': 'https://dummyimage.com/400x300/0d9488/ffffff&text=PGDCA'
    };
    
    console.log('Updating course images with dummyimage.com URLs...\n');
    
    let updatedCount = 0;
    
    for (const [courseCode, newImageUrl] of Object.entries(workingImageMappings)) {
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
