const mongoose = require('mongoose');

const MasterResultSchema = new mongoose.Schema({
  // Associated Information
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterExam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterStudent',
    required: true
  },
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
  
  // Marks Information
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
  },
  gradePoints: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  
  // Result Status
  resultStatus: {
    type: String,
    enum: ['Pass', 'Fail', 'Absent', 'Withheld', 'Under Review'],
    required: true
  },
  isPassed: {
    type: Boolean,
    required: true
  },
  
  // Detailed Marks (if applicable)
  detailedMarks: [{
    component: {
      type: String,
      required: true,
      trim: true
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 0
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    weightage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  }],
  
  // Attendance Information
  attendanceStatus: {
    type: String,
    enum: ['Present', 'Absent', 'Medical Leave', 'Special Leave'],
    required: true
  },
  attendancePercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Evaluation Details
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterEmployee',
    required: true
  },
  evaluatedAt: {
    type: Date,
    default: Date.now
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterEmployee'
  },
  verifiedAt: {
    type: Date
  },
  
  // Revaluation Information
  revaluationRequested: {
    type: Boolean,
    default: false
  },
  revaluationStatus: {
    type: String,
    enum: ['None', 'Requested', 'Under Review', 'Approved', 'Rejected'],
    default: 'None'
  },
  revaluationFee: {
    type: Number,
    default: 0
  },
  revaluationFeePaid: {
    type: Boolean,
    default: false
  },
  revaluationMarks: {
    type: Number
  },
  revaluationResult: {
    type: String,
    enum: ['No Change', 'Increased', 'Decreased'],
    default: 'No Change'
  },
  revaluationRemarks: {
    type: String,
    trim: true
  },
  
  // Remarks and Feedback
  remarks: {
    type: String,
    trim: true
  },
  internalRemarks: {
    type: String,
    trim: true
  },
  
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
MasterResultSchema.index({ exam: 1 });
MasterResultSchema.index({ student: 1 });
MasterResultSchema.index({ subject: 1 });
MasterResultSchema.index({ course: 1 });
MasterResultSchema.index({ semester: 1 });
MasterResultSchema.index({ branchId: 1 });
MasterResultSchema.index({ resultStatus: 1 });
MasterResultSchema.index({ isPublished: 1 });
MasterResultSchema.index({ revaluationStatus: 1 });

// Compound index for unique exam-student combination
MasterResultSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('MasterResult', MasterResultSchema);
