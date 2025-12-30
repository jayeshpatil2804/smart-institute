const mongoose = require('mongoose');

const MasterExamSchema = new mongoose.Schema({
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
  
  // Exam Details
  examType: {
    type: String,
    enum: ['Internal', 'External', 'Practical', 'Assignment', 'Quiz', 'Mid Term', 'Final', 'Supplementary'],
    required: true
  },
  category: {
    type: String,
    enum: ['Regular', 'Supplementary', 'Improvement', 'Special'],
    required: true
  },
  
  // Associated Information
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterSubject',
    required: true
  },
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
  
  // Schedule
  examDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    trim: true
  },
  endTime: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15
  },
  
  // Venue Information
  venue: {
    type: String,
    required: true,
    trim: true
  },
  roomNumber: {
    type: String,
    trim: true
  },
  seatingArrangement: {
    type: String,
    trim: true
  },
  
  // Exam Configuration
  maxMarks: {
    type: Number,
    required: true,
    min: 1
  },
  passingMarks: {
    type: Number,
    required: true,
    min: 0
  },
  negativeMarking: {
    type: Boolean,
    default: false
  },
  negativeMarkingValue: {
    type: Number,
    default: 0
  },
  
  // Question Paper Details
  questionPaper: {
    fileUrl: {
      type: String,
      trim: true
    },
    uploadedAt: {
      type: Date
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Instructions
  instructions: [{
    type: String,
    trim: true
  }],
  
  // Eligibility
  eligibleStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MasterStudent'
    },
    enrollmentNumber: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['Eligible', 'Not Eligible', 'Debarred'],
      default: 'Eligible'
    }
  }],
  
  // Invigilation
  invigilators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterEmployee'
  }],
  chiefInvigilator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterEmployee'
  },
  
  // Status and Workflow
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Postponed'],
    default: 'Scheduled'
  },
  publishResults: {
    type: Boolean,
    default: false
  },
  resultPublishDate: {
    type: Date
  },
  
  // Settings
  allowRevaluation: {
    type: Boolean,
    default: false
  },
  revaluationDeadline: {
    type: Date
  },
  revaluationFee: {
    type: Number,
    default: 0
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
MasterExamSchema.index({ title: 1 });
MasterExamSchema.index({ subject: 1 });
MasterExamSchema.index({ course: 1 });
MasterExamSchema.index({ semester: 1 });
MasterExamSchema.index({ examDate: 1 });
MasterExamSchema.index({ branchId: 1 });
MasterExamSchema.index({ examType: 1 });
MasterExamSchema.index({ status: 1 });

module.exports = mongoose.model('MasterExam', MasterExamSchema);
