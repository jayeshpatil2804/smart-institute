const mongoose = require('mongoose');
const Course = require('./models/Course');
require('dotenv').config();

const updateImageUrls = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-institute');
    console.log('Connected to MongoDB');

    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses to update`);

    for (const course of courses) {
      const newImageUrl = `https://picsum.photos/seed/${course.code}/400/300.jpg`;
      await Course.findByIdAndUpdate(course._id, { image: newImageUrl });
      console.log(`Updated ${course.code}: ${course.image} -> ${newImageUrl}`);
    }

    console.log('All image URLs updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating image URLs:', error);
    process.exit(1);
  }
};

updateImageUrls();
