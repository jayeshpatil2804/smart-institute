const http = require('http');

const testBranchesAPI = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/branches',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const branches = JSON.parse(data);
        console.log(`Found ${branches.length} branches:`);
        
        branches.forEach(branch => {
          console.log(`\n- ${branch.name} (${branch.code})`);
          console.log(`  Address: ${branch.address.street}, ${branch.address.city}, ${branch.address.state} - ${branch.address.pincode}`);
          console.log(`  Phone: ${branch.contact?.phone || 'N/A'}`);
          console.log(`  Mobile: ${branch.contact?.mobile || 'N/A'}`);
          console.log(`  Email: ${branch.contact?.email || 'N/A'}`);
          console.log(`  Active: ${branch.isActive}`);
        });
        
        console.log('\n✅ Branches API is working correctly!');
      } catch (error) {
        console.error('❌ Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error testing branches API:', error.message);
  });

  req.end();
};

testBranchesAPI();
