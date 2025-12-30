const https = require('https');

// Test a few sample image URLs to verify they're working
const testImageURL = (url) => {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
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
    
    req.setTimeout(3000, () => {
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

const testSampleImages = async () => {
  console.log('Testing sample course images...\n');
  
  const sampleImages = [
    'https://picsum.photos/seed/accounting-smart/400/300.jpg',
    'https://picsum.photos/seed/web-designing/400/300.jpg',
    'https://picsum.photos/seed/textile-design/400/300.jpg',
    'https://picsum.photos/seed/computer-application/400/300.jpg'
  ];
  
  for (const imageUrl of sampleImages) {
    const result = await testImageURL(imageUrl);
    
    if (result.accessible) {
      console.log(`✅ ${result.status} - ${result.contentType}`);
      console.log(`   ${imageUrl}`);
    } else {
      console.log(`❌ ${result.status} - ${result.error || 'Not accessible'}`);
      console.log(`   ${imageUrl}`);
    }
    console.log('');
  }
};

testSampleImages();
