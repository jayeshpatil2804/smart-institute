const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Accounting', 'Designing', '10+2/ College Students', 'IT For Beginners', 'Diploma', 'Global IT Certifications']
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  status: {
    type: String,
    enum: ['Active', 'Featured', 'Upcoming'],
    default: 'Active'
  },
  duration: {
    type: Number,
    required: true // in months
  },
  fees: {
    type: Number,
    required: true
  },
  branches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  }],
  image: {
    type: String,
    default: ''
  },
  syllabus: [{
    module: String,
    topics: [String]
  }],
  prerequisites: [String],
  outcomes: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  maxStudents: {
    type: Number,
    default: 30
  },
  currentEnrollments: {
    type: Number,
    default: 0
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  schedule: {
    days: [String], // Monday, Tuesday, etc.
    time: String, // 9:00 AM - 12:00 PM
    mode: {
      type: String,
      enum: ['Offline', 'Online', 'Hybrid'],
      default: 'Offline'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
