const mongoose = require('mongoose');

const MasterFreeLearningSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true
  },
  
  // Learning Resource Type
  resourceType: {
    type: String,
    enum: ['Video Course', 'Article', 'Tutorial', 'Webinar', 'eBook', 'Podcast', 'Workshop', 'Certification'],
    required: true
  },
  category: {
    type: String,
    enum: ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'AI/ML', 'Web Development', 'Mobile Development', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'Other'],
    required: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  
  // Provider Information
  provider: {
    type: String,
    required: true,
    trim: true
  },
  providerUrl: {
    type: String,
    trim: true
  },
  instructor: {
    type: String,
    trim: true
  },
  instructorBio: {
    type: String,
    trim: true
  },
  
  // Difficulty and Duration
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  durationUnit: {
    type: String,
    enum: ['Minutes', 'Hours', 'Days', 'Weeks'],
    required: true
  },
  
  // Media Content
  thumbnail: {
    type: String,
    required: true,
    trim: true
  },
  previewVideo: {
    type: String,
    trim: true
  },
  materials: [{
    type: {
      type: String,
      enum: ['Video', 'PDF', 'Document', 'Link', 'Image', 'Audio'],
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
    duration: {
      type: Number
    },
    size: {
      type: Number
    },
    description: {
      type: String,
      trim: true
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Learning Objectives
  objectives: [{
    type: String,
    required: true,
    trim: true
  }],
  
  // Prerequisites
  prerequisites: [{
    type: String,
    trim: true
  }],
  
  // Skills Gained
  skills: [{
    type: String,
    required: true,
    trim: true
  }],
  
  // Target Audience
  targetAudience: {
    type: String,
    enum: ['Students', 'Faculty', 'All Users', 'Specific Role'],
    default: 'All Users'
  },
  targetRoles: [{
    type: String,
    trim: true
  }],
  
  // Language and Accessibility
  language: {
    type: String,
    required: true,
    trim: true
  },
  subtitles: [{
    type: String,
    trim: true
  }],
  accessibility: {
    hasTranscript: {
      type: Boolean,
      default: false
    },
    hasCaptions: {
      type: Boolean,
      default: false
    },
    isScreenReaderFriendly: {
      type: Boolean,
      default: false
    }
  },
  
  // Certification
  hasCertificate: {
    type: Boolean,
    default: false
  },
  certificateDetails: {
    type: String,
    trim: true
  },
  certificateTemplate: {
    type: String,
    trim: true
  },
  
  // Rating and Reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  }],
  
  // Enrollment and Progress
  enrollmentCount: {
    type: Number,
    default: 0
  },
  completionCount: {
    type: Number,
    default: 0
  },
  averageProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Status and Visibility
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived', 'Under Review'],
    default: 'Draft'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: true
  },
  
  // Tags and SEO
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  
  // External Links
  externalUrl: {
    type: String,
    trim: true
  },
  resourceUrl: {
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
MasterFreeLearningSchema.index({ title: 1 });
MasterFreeLearningSchema.index({ resourceType: 1 });
MasterFreeLearningSchema.index({ category: 1 });
MasterFreeLearningSchema.index({ difficulty: 1 });
MasterFreeLearningSchema.index({ branchId: 1 });
MasterFreeLearningSchema.index({ status: 1 });
MasterFreeLearningSchema.index({ isPublished: 1 });
MasterFreeLearningSchema.index({ isFeatured: 1 });
MasterFreeLearningSchema.index({ tags: 1 });
MasterFreeLearningSchema.index({ 'rating.average': 1 });

module.exports = mongoose.model('MasterFreeLearning', MasterFreeLearningSchema);
