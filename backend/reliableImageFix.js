const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Use reliable, non-redirecting image URLs
    const reliableImageMappings = {
      // Accounting Courses - Business/Finance themed
      'CAT_SMART': 'https://via.placeholder.com/400x300/2563eb/ffffff?text=Accounting+Smart',
      'CAT': 'https://via.placeholder.com/400x300/2563eb/ffffff?text=Accounting+Training',
      'FEM': 'https://via.placeholder.com/400x300/2563eb/ffffff?text=Financial+Management',
      'TALLY_ERP9': 'https://via.placeholder.com/400x300/2563eb/ffffff?text=Tally+ERP9',
      
      // Designing Courses - Creative themed
      'CTD': 'https://via.placeholder.com/400x300/dc2626/ffffff?text=Textile+Design',
      'CDP': 'https://via.placeholder.com/400x300/dc2626/ffffff?text=Digital+Printing',
      'DTP': 'https://via.placeholder.com/400x300/dc2626/ffffff?text=Desktop+Publishing',
      'TD': 'https://via.placeholder.com/400x300/dc2626/ffffff?text=Textile+Designing',
      'CDM': 'https://via.placeholder.com/400x300/dc2626/ffffff?text=Digital+Marketing',
      
      // College Students Courses - Mixed theme
      'DTDA': 'https://via.placeholder.com/400x300/7c3aed/ffffff?text=Diploma+Textile+Accounting',
      'CABT': 'https://via.placeholder.com/400x300/7c3aed/ffffff?text=Computer+Basic+Tally',
      
      // IT For Beginners - Technology themed
      'MC': 'https://via.placeholder.com/400x300/059669/ffffff?text=My+Computer',
      'CCA': 'https://via.placeholder.com/400x300/059669/ffffff?text=Computer+Application',
      'KP': 'https://via.placeholder.com/400x300/059669/ffffff?text=Kids+Programming',
      'CAS': 'https://via.placeholder.com/400x300/059669/ffffff?text=Application+Software',
      'BCC': 'https://via.placeholder.com/400x300/059669/ffffff?text=Computer+Concept',
      
      // Diploma & Advanced Courses
      'ADCA': 'https://via.placeholder.com/400x300/ea580c/ffffff?text=ADCA',
      
      // Global IT Certifications - Professional themed
      'CAWD': 'https://via.placeholder.com/400x300/0d9488/ffffff?text=Web+Designing',
      'DSM': 'https://via.placeholder.com/400x300/0d9488/ffffff?text=Software+Management',
      'CASD': 'https://via.placeholder.com/400x300/0d9488/ffffff?text=Software+Development',
      'PGDCA': 'https://via.placeholder.com/400x300/0d9488/ffffff?text=PGDCA'
    };
    
    console.log('Updating course images with reliable placeholder URLs...\n');
    
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
        }
      } catch (error) {
        console.error(`❌ Error updating ${courseCode}:`, error.message);
      }
    }
    
    console.log(`\n✅ Successfully updated ${updatedCount} course images with reliable placeholder URLs!`);
    
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
