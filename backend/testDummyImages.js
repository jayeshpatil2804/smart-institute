const https = require('https');

// Test the new dummyimage.com URLs
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

const testDummyImages = async () => {
  console.log('Testing dummyimage.com URLs...\n');
  
  const sampleImages = [
    'https://dummyimage.com/400x300/2563eb/ffffff&text=Accounting+Smart',
    'https://dummyimage.com/400x300/dc2626/ffffff&text=Textile+Design',
    'https://dummyimage.com/400x300/059669/ffffff&text=My+Computer',
    'https://dummyimage.com/400x300/0d9488/ffffff&text=Web+Designing'
  ];
  
  let successCount = 0;
  
  for (const imageUrl of sampleImages) {
    const result = await testImageURL(imageUrl);
    
    if (result.accessible) {
      console.log(`✅ ${result.status} - ${result.contentType}`);
      successCount++;
    } else {
      console.log(`❌ ${result.status} - ${result.error || 'Not accessible'}`);
    }
    console.log(`   ${imageUrl}\n`);
  }
  
  console.log(`Summary: ${successCount}/${sampleImages.length} images are working`);
};

testDummyImages();
