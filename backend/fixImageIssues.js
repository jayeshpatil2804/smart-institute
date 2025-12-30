const mongoose = require('mongoose');
const https = require('https');
const http = require('http');

require('dotenv').config();

// Function to check if an image URL is accessible
const checkImageURL = (url) => {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        accessible: res.statusCode === 200,
        contentType: res.headers['content-type']
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        accessible: false,
        error: err.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        accessible: false,
        error: 'Request timeout'
      });
    });
  });
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const courses = await db.collection('courses').find({}).toArray();
    
    console.log('Checking accessibility of course images...\n');
    
    let accessibleCount = 0;
    let inaccessibleCount = 0;
    
    for (const course of courses) {
      const result = await checkImageURL(course.image);
      
      if (result.accessible) {
        console.log(`✅ ${course.code}: ${result.status} - ${result.contentType}`);
        accessibleCount++;
      } else {
        console.log(`❌ ${course.code}: ${result.status} - ${result.error || 'Not accessible'}`);
        inaccessibleCount++;
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`✅ Accessible images: ${accessibleCount}`);
    console.log(`❌ Inaccessible images: ${inaccessibleCount}`);
    
    if (inaccessibleCount > 0) {
      console.log('\nFixing inaccessible images with reliable alternatives...');
      
      // Define reliable fallback images for each category
      const fallbackImages = {
        'Accounting': 'https://images.unsplash.com/photo-1554224154-260325c0538c?w=400&h=300&fit=crop&crop=center',
        'Designing': 'https://images.unsplash.com/photo-1522735338363-c10fff3093b6?w=400&h=300&fit=crop&crop=center',
        '10+2/ College Students': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop&crop=center',
        'IT For Beginners': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop&crop=center',
        'Diploma': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop&crop=center',
        'Global IT Certifications': 'https://images.unsplash.com/photo-1467232004584-a241e860d849?w=400&h=300&fit=crop&crop=center'
      };
      
      // Update courses with inaccessible images
      for (const course of courses) {
        const result = await checkImageURL(course.image);
        
        if (!result.accessible) {
          const fallbackUrl = fallbackImages[course.category] || fallbackImages['IT For Beginners'];
          
          const updateResult = await db.collection('courses').updateOne(
            { _id: course._id },
            { $set: { image: fallbackUrl } }
          );
          
          if (updateResult.modifiedCount > 0) {
            console.log(`🔧 Fixed ${course.code}: Updated to reliable image`);
          }
        }
      }
      
      console.log('\n✅ All inaccessible images have been fixed!');
    }
    
    await mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
