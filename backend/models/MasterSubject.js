const mongoose = require('mongoose');

const MasterSubjectSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Academic Information
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  
  // Credits and Hours
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  lectureHours: {
    type: Number,
    required: true,
    min: 0
  },
  practicalHours: {
    type: Number,
    required: true,
    min: 0
  },
  tutorialHours: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Subject Type
  type: {
    type: String,
    enum: ['Theory', 'Practical', 'Theory + Practical', 'Elective', 'Core'],
    required: true
  },
  
  // Prerequisites
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterSubject'
  }],
  
  // Faculty Assignment
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterEmployee'
  },
  
  // Syllabus
  syllabus: [{
    unit: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    topics: [{
      type: String,
      trim: true
    }]
  }],
  
  // Assessment Scheme
  assessment: {
    internal: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    external: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    components: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      weightage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      }
    }]
  },
  
  // Reference Materials
  referenceBooks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    publisher: {
      type: String,
      trim: true
    },
    edition: {
      type: String,
      trim: true
    }
  }],
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Review'],
    default: 'Active'
  },
  
  // System Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
MasterSubjectSchema.index({ course: 1 });
MasterSubjectSchema.index({ semester: 1 });
MasterSubjectSchema.index({ branchId: 1 });
MasterSubjectSchema.index({ department: 1 });
MasterSubjectSchema.index({ status: 1 });

module.exports = mongoose.model('MasterSubject', MasterSubjectSchema);
