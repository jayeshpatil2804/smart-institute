const https = require('https');

// Test the new image URLs
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

const testFinalImages = async () => {
  console.log('Testing final course image URLs...\n');
  
  const sampleImages = [
    'https://picsum.photos/400/300?random=1',
    'https://picsum.photos/400/300?random=5',
    'https://picsum.photos/400/300?random=12',
    'https://picsum.photos/400/300?random=18'
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

testFinalImages();
