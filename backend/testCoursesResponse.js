const http = require('http');

// Test the courses API endpoint to see the response structure
const testCoursesAPI = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/courses',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('API Response Status:', res.statusCode);
        console.log('Response Type:', typeof response);
        console.log('Is Array?', Array.isArray(response));
        console.log('Response Keys:', Object.keys(response));
        console.log('Sample Response:', JSON.stringify(response, null, 2).substring(0, 500) + '...');
      } catch (error) {
        console.error('Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });

  req.end();
};

testCoursesAPI();
