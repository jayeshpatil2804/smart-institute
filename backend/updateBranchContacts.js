const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Update the branches to add mobile field and correct phone numbers
    console.log('Updating branches with correct phone structure...');
    
    // Update Godadara branch
    const godadaraResult = await db.collection('branches').updateOne(
      { name: 'Godadara' },
      { 
        $set: {
          'contact.phone': '9898830409',
          'contact.mobile': '9601749300'
        }
      }
    );
    console.log(`Updated Godadara branch: ${godadaraResult.modifiedCount} document(s)`);
    
    // Update Bhestan branch
    const bhestanResult = await db.collection('branches').updateOne(
      { name: 'Bhestan' },
      { 
        $set: {
          'contact.phone': '9601749300',
          'contact.mobile': '9898830409'
        }
      }
    );
    console.log(`Updated Bhestan branch: ${bhestanResult.modifiedCount} document(s)`);
    
    // Verify the changes
    console.log('\nVerifying updated branches:');
    const branches = await db.collection('branches').find({}).toArray();
    branches.forEach(branch => {
      console.log(`\nBranch: ${branch.name} (${branch.code})`);
      console.log(`Address: ${branch.address.street}, ${branch.address.city}, ${branch.address.state} - ${branch.address.pincode}`);
      console.log(`Phone: ${branch.contact?.phone || 'N/A'}`);
      console.log(`Mobile: ${branch.contact?.mobile || 'N/A'}`);
      console.log(`Email: ${branch.contact?.email || 'N/A'}`);
    });
    
    await mongoose.disconnect();
    console.log('\nBranch updates completed successfully!');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
