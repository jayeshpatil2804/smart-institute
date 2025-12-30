const mongoose = require('mongoose');

const MasterFeedbackSchema = new mongoose.Schema({
  // Basic Information
  feedbackNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  feedbackType: {
    type: String,
    enum: ['Course', 'Faculty', 'Facility', 'Infrastructure', 'Administration', 'Event', 'General'],
    required: true
  },
  
  // Target Information
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetModel: {
    type: String,
    enum: ['Course', 'MasterSubject', 'MasterEmployee', 'Branch', 'MasterExam'],
    required: true
  },
  targetName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Respondent Information
  respondent: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'respondentModel',
    required: true
  },
  respondentModel: {
    type: String,
    enum: ['MasterStudent', 'MasterEmployee', 'User'],
    required: true
  },
  respondentName: {
    type: String,
    required: true,
    trim: true
  },
  respondentEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  
  // Academic Context (for student feedback)
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterSubject'
  },
  
  // Feedback Categories and Ratings
  categories: [{
    name: {
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
    weightage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    comments: {
      type: String,
      trim: true
    }
  }],
  
  // Overall Rating
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // Detailed Feedback
  strengths: {
    type: String,
    trim: true
  },
  weaknesses: {
    type: String,
    trim: true
  },
  suggestions: {
    type: String,
    trim: true
  },
  additionalComments: {
    type: String,
    trim: true
  },
  
  // Specific Questions (for structured feedback)
  questions: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['rating', 'text', 'boolean', 'multiple'],
      required: true
    },
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    weightage: {
      type: Number,
      default: 0
    }
  }],
  
  // Anonymous Option
  isAnonymous: {
    type: Boolean,
    default: false
  },
  anonymousCode: {
    type: String,
    trim: true
  },
  
  // Feedback Period
  feedbackPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  // Status and Workflow
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Processed', 'Archived'],
    default: 'Submitted'
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  
  // Processing Details
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterEmployee'
  },
  processedByName: {
    type: String,
    trim: true
  },
  processedAt: {
    type: Date
  },
  processingNotes: {
    type: String,
    trim: true
  },
  
  // Action Taken
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionTaken: {
    type: String,
    trim: true
  },
  actionTakenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterEmployee'
  },
  actionTakenAt: {
    type: Date
  },
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  followUpNotes: {
    type: String,
    trim: true
  },
  
  // Visibility and Sharing
  isPublic: {
    type: Boolean,
    default: false
  },
  shareWithTarget: {
    type: Boolean,
    default: false
  },
  sharedAt: {
    type: Date
  },
  
  // Analytics
  sentiment: {
    type: String,
    enum: ['Positive', 'Neutral', 'Negative', 'Mixed'],
    default: 'Neutral'
  },
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1
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
MasterFeedbackSchema.index({ feedbackType: 1 });
MasterFeedbackSchema.index({ targetId: 1, targetModel: 1 });
MasterFeedbackSchema.index({ respondent: 1 });
MasterFeedbackSchema.index({ course: 1 });
MasterFeedbackSchema.index({ semester: 1 });
MasterFeedbackSchema.index({ branchId: 1 });
MasterFeedbackSchema.index({ status: 1 });
MasterFeedbackSchema.index({ overallRating: 1 });
MasterFeedbackSchema.index({ submittedAt: 1 });

module.exports = mongoose.model('MasterFeedback', MasterFeedbackSchema);
