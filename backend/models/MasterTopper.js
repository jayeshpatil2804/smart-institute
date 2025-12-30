const mongoose = require('mongoose');

const MasterTopperSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Achievement Type
  achievementType: {
    type: String,
    enum: ['Semester Topper', 'Annual Topper', 'Subject Topper', 'Course Topper', 'Branch Topper', 'Overall Topper'],
    required: true
  },
  category: {
    type: String,
    enum: ['Academic', 'Sports', 'Cultural', 'Technical', 'Research', 'Other'],
    required: true
  },
  
  // Academic Period
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  examType: {
    type: String,
    enum: ['Internal', 'External', 'Final', 'Comprehensive'],
    required: true
  },
  
  // Student Information
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterStudent',
    required: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  enrollmentNumber: {
    type: String,
    required: true,
    trim: true
  },
  
  // Academic Information
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  branchName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Performance Details
  rank: {
    type: Number,
    required: true,
    min: 1
  },
  totalStudents: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10
  },
  sgpa: {
    type: Number,
    min: 0,
    max: 10
  },
  
  // Subject-wise Performance (if applicable)
  subjectPerformance: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MasterSubject',
      required: true
    },
    subjectName: {
      type: String,
      required: true,
      trim: true
    },
    subjectCode: {
      type: String,
      required: true,
      trim: true
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    grade: {
      type: String,
      required: true,
      trim: true
    }
  }],
  
  // Achievement Details
  achievementDescription: {
    type: String,
    required: true,
    trim: true
  },
  achievementDate: {
    type: Date,
    required: true
  },
  competitionName: {
    type: String,
    trim: true
  },
  competitionLevel: {
    type: String,
    enum: ['Branch', 'College', 'University', 'State', 'National', 'International'],
    trim: true
  },
  competitionDate: {
    type: Date
  },
  
  // Awards and Recognition
  awards: [{
    awardName: {
      type: String,
      required: true,
      trim: true
    },
    awardingBody: {
      type: String,
      trim: true
    },
    awardDate: {
      type: Date,
      required: true
    },
    prize: {
      type: String,
      trim: true
    },
    certificateUrl: {
      type: String,
      trim: true
    }
  }],
  
  // Media and Documentation
  photo: {
    type: String,
    trim: true
  },
  certificate: {
    type: String,
    trim: true
  },
  documents: [{
    type: {
      type: String,
      enum: ['Certificate', 'Photo', 'Video', 'Document', 'Other'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  
  // Faculty Comments
  facultyComments: [{
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MasterEmployee',
      required: true
    },
    facultyName: {
      type: String,
      required: true,
      trim: true
    },
    comments: {
      type: String,
      required: true,
      trim: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Publication Status
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Featured Status
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredAt: {
    type: Date
  },
  
  // Social Media Sharing
  sharedOnSocialMedia: {
    type: Boolean,
    default: false
  },
  socialMediaPlatforms: [{
    platform: {
      type: String,
      enum: ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'Website'],
      required: true
    },
    url: {
      type: String,
      trim: true
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Published', 'Archived'],
    default: 'Pending'
  },
  verificationStatus: {
    type: String,
    enum: ['Not Verified', 'Verified', 'Rejected'],
    default: 'Not Verified'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterEmployee'
  },
  verifiedAt: {
    type: Date
  },
  verificationNotes: {
    type: String,
    trim: true
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
MasterTopperSchema.index({ title: 1 });
MasterTopperSchema.index({ student: 1 });
MasterTopperSchema.index({ enrollmentNumber: 1 });
MasterTopperSchema.index({ course: 1 });
MasterTopperSchema.index({ branch: 1 });
MasterTopperSchema.index({ academicYear: 1 });
MasterTopperSchema.index({ semester: 1 });
MasterTopperSchema.index({ achievementType: 1 });
MasterTopperSchema.index({ category: 1 });
MasterTopperSchema.index({ rank: 1 });
MasterTopperSchema.index({ status: 1 });
MasterTopperSchema.index({ isPublished: 1 });
MasterTopperSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('MasterTopper', MasterTopperSchema);
