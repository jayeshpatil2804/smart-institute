const http = require('http');

// Test the branches API endpoint
const testBranchAPI = (branchId) => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/branches/${branchId}`,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const branch = JSON.parse(data);
        console.log(`✅ Branch API Test - Branch ID: ${branchId}`);
        console.log(`Name: ${branch.name}`);
        console.log(`Code: ${branch.code}`);
        console.log(`Address: ${branch.address.street}, ${branch.address.city}`);
        console.log(`Phone: ${branch.contact?.phone || 'N/A'}`);
        console.log(`Mobile: ${branch.contact?.mobile || 'N/A'}`);
        console.log('---');
      } catch (error) {
        console.error(`❌ Error testing branch ${branchId}:`, error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error(`❌ Request error for branch ${branchId}:`, error.message);
  });

  req.end();
};

// Test both branches
console.log('Testing branch API endpoints...');
testBranchAPI('69524491f46eca65522c827d'); // Godadara
testBranchAPI('69524491f46eca65522c827e'); // Bhestan
