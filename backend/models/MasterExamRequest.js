const mongoose = require('mongoose');

const MasterExamRequestSchema = new mongoose.Schema({
  // Basic Information
  requestNumber: {
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
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Request Type
  requestType: {
    type: String,
    enum: ['Regular Exam', 'Supplementary Exam', 'Improvement Exam', 'Special Exam', 'Re-exam', 'Make-up Exam'],
    required: true
  },
  urgency: {
    type: String,
    enum: ['Normal', 'Urgent', 'Critical'],
    default: 'Normal'
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
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  
  // Subject Information
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
  
  // Exam Details
  originalExamDate: {
    type: Date
  },
  requestedExamDate: {
    type: Date,
    required: true
  },
  preferredTimeSlot: {
    type: String,
    trim: true
  },
  examDuration: {
    type: Number,
    required: true,
    min: 15
  },
  
  // Reason for Request
  reason: {
    type: String,
    enum: ['Medical', 'Family Emergency', 'Personal Emergency', 'Official Work', 'Travel', 'Technical Issue', 'Other'],
    required: true
  },
  reasonDescription: {
    type: String,
    required: true,
    trim: true
  },
  
  // Supporting Documents
  documents: [{
    type: {
      type: String,
      enum: ['Medical Certificate', 'Death Certificate', 'Travel Document', 'Official Letter', 'Other'],
      required: true
    },
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
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      trim: true
    }
  }],
  
  // Academic Details
  currentAttendance: {
    type: Number,
    min: 0,
    max: 100
  },
  internalMarks: {
    type: Number,
    min: 0
  },
  previousAttempts: {
    type: Number,
    default: 0,
    min: 0
  },
  backlogs: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Faculty Recommendations
  facultyRecommendation: {
    recommended: {
      type: Boolean,
      default: false
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MasterEmployee'
    },
    facultyName: {
      type: String,
      trim: true
    },
    comments: {
      type: String,
      trim: true
    },
    recommendedAt: {
      type: Date
    }
  },
  
  // HOD Approval
  hodApproval: {
    approved: {
      type: Boolean,
      default: false
    },
    hod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MasterEmployee'
    },
    hodName: {
      type: String,
      trim: true
    },
    comments: {
      type: String,
      trim: true
    },
    approvedAt: {
      type: Date
    }
  },
  
  // Principal Approval
  principalApproval: {
    approved: {
      type: Boolean,
      default: false
    },
    principal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MasterEmployee'
    },
    principalName: {
      type: String,
      trim: true
    },
    comments: {
      type: String,
      trim: true
    },
    approvedAt: {
      type: Date
    }
  },
  
  // Examination Cell Approval
  examCellApproval: {
    approved: {
      type: Boolean,
      default: false
    },
    examCell: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MasterEmployee'
    },
    examCellName: {
      type: String,
      trim: true
    },
    comments: {
      type: String,
      trim: true
    },
    approvedAt: {
      type: Date
    },
    scheduledDate: {
      type: Date
    },
    scheduledTime: {
      type: String,
      trim: true
    },
    venue: {
      type: String,
      trim: true
    }
  },
  
  // Fee Information
  feeRequired: {
    type: Boolean,
    default: false
  },
  feeAmount: {
    type: Number,
    default: 0
  },
  feePaid: {
    type: Boolean,
    default: false
  },
  feePaidAt: {
    type: Date
  },
  feeReceipt: {
    type: String,
    trim: true
  },
  
  // Status and Workflow
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Faculty Recommended', 'HOD Approved', 'Principal Approved', 'Exam Cell Approved', 'Rejected', 'Scheduled', 'Completed', 'Withdrawn'],
    default: 'Submitted'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterEmployee'
  },
  rejectedAt: {
    type: Date
  },
  
  // Communication Log
  communications: [{
    type: {
      type: String,
      enum: ['Email', 'SMS', 'Phone', 'In-Person', 'System'],
      required: true
    },
    recipient: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentByName: {
      type: String,
      trim: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Internal Notes
  internalNotes: [{
    note: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedByName: {
      type: String,
      required: true,
      trim: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
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
MasterExamRequestSchema.index({ student: 1 });
MasterExamRequestSchema.index({ enrollmentNumber: 1 });
MasterExamRequestSchema.index({ subject: 1 });
MasterExamRequestSchema.index({ course: 1 });
MasterExamRequestSchema.index({ semester: 1 });
MasterExamRequestSchema.index({ branchId: 1 });
MasterExamRequestSchema.index({ status: 1 });
MasterExamRequestSchema.index({ requestType: 1 });
MasterExamRequestSchema.index({ requestedExamDate: 1 });

module.exports = mongoose.model('MasterExamRequest', MasterExamRequestSchema);
