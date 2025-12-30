const mongoose = require('mongoose');

const MasterNewsSchema = new mongoose.Schema({
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
  summary: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  
  // News Category and Type
  category: {
    type: String,
    enum: ['General', 'Academic', 'Events', 'Achievements', 'Notifications', 'Holidays', 'Recruitment', 'Sports', 'Cultural'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  
  // Media
  featuredImage: {
    type: String,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    }
  }],
  attachments: [{
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true,
      trim: true
    }
  }],
  
  // Publication Schedule
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  
  // Target Audience
  targetAudience: {
    type: String,
    enum: ['All', 'Students', 'Faculty', 'Staff', 'Admin', 'Specific Branch', 'Specific Course'],
    default: 'All'
  },
  targetBranches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  }],
  targetCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  targetSemesters: [{
    type: Number,
    min: 1,
    max: 8
  }],
  
  // Tags for Search
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // SEO
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  
  // Author Information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterEmployee',
    required: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Status and Workflow
  status: {
    type: String,
    enum: ['Draft', 'Under Review', 'Published', 'Archived', 'Scheduled'],
    default: 'Draft'
  },
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
  
  // View and Engagement Tracking
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  
  // Comments (if enabled)
  allowComments: {
    type: Boolean,
    default: false
  },
  comments: [{
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
    comment: {
      type: String,
      required: true,
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
  
  // Notifications
  sendNotification: {
    type: Boolean,
    default: false
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationSentAt: {
    type: Date
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
MasterNewsSchema.index({ title: 1 });
MasterNewsSchema.index({ category: 1 });
MasterNewsSchema.index({ priority: 1 });
MasterNewsSchema.index({ publishDate: 1 });
MasterNewsSchema.index({ branchId: 1 });
MasterNewsSchema.index({ status: 1 });
MasterNewsSchema.index({ isPublished: 1 });
MasterNewsSchema.index({ tags: 1 });
MasterNewsSchema.index({ targetAudience: 1 });

module.exports = mongoose.model('MasterNews', MasterNewsSchema);
