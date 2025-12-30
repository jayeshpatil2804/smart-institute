const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const mainBranchId = '69523c90367a3755d3ea96ac';
    
    // Step 1: Delete the Main Branch
    console.log('Deleting Main Branch...');
    const deleteResult = await db.collection('branches').deleteOne({ _id: new mongoose.Types.ObjectId(mainBranchId) });
    console.log(`Deleted ${deleteResult.deletedCount} branch(es)`);
    
    // Step 2: Add Godadara Branch
    console.log('\nAdding Godadara Branch...');
    const godadaraBranch = {
      name: 'Godadara',
      code: 'GD',
      address: {
        street: '1st & 2nd Floor, 50 Kuber Nagar, Opp. Baba Baijnath Mandir, Nilgiri Road, Aas Pass Circle, Godadara',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395010'
      },
      contact: {
        phone: '9898830409',
        email: 'godadara@smartinstitute.co.in'
      },
      isActive: true,
      facilities: ['Classrooms', 'Computer Lab', 'Library', 'Parking'],
      totalStudents: 0,
      totalStaff: 0
    };
    
    const godadaraResult = await db.collection('branches').insertOne(godadaraBranch);
    console.log(`Added Godadara branch with ID: ${godadaraResult.insertedId}`);
    
    // Step 3: Add Bhestan Branch
    console.log('\nAdding Bhestan Branch...');
    const bhestanBranch = {
      name: 'Bhestan',
      code: 'BH',
      address: {
        street: '309-A, 309-B, 3rd Floor, Sai Square Building, Bhestan Circle, Bhestan',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395023'
      },
      contact: {
        phone: '9601749300',
        email: 'bhestan@smartinstitute.co.in'
      },
      isActive: true,
      facilities: ['Classrooms', 'Computer Lab', 'Library', 'Parking'],
      totalStudents: 0,
      totalStaff: 0
    };
    
    const bhestanResult = await db.collection('branches').insertOne(bhestanBranch);
    console.log(`Added Bhestan branch with ID: ${bhestanResult.insertedId}`);
    
    // Step 4: Verify the changes
    console.log('\nVerifying changes...');
    const branches = await db.collection('branches').find({}).toArray();
    console.log(`Total branches now: ${branches.length}`);
    branches.forEach(branch => {
      console.log(`- ${branch.name} (${branch.code}) - ${branch.address.city}, ${branch.address.state}`);
    });
    
    await mongoose.disconnect();
    console.log('\nBranch migration completed successfully!');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
