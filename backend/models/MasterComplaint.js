const mongoose = require('mongoose');

const MasterComplaintSchema = new mongoose.Schema({
  // Basic Information
  complaintNumber: {
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
  
  // Complainant Information
  complainant: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'complainantModel',
    required: true
  },
  complainantModel: {
    type: String,
    enum: ['MasterStudent', 'MasterEmployee', 'User'],
    required: true
  },
  complainantName: {
    type: String,
    required: true,
    trim: true
  },
  complainantEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  complainantPhone: {
    type: String,
    trim: true
  },
  
  // Complaint Category and Priority
  category: {
    type: String,
    enum: ['Academic', 'Administrative', 'Infrastructure', 'Facility', 'Staff', 'Student', 'Examination', 'Fee', 'Other'],
    required: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  // Location Information
  location: {
    type: String,
    trim: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  department: {
    type: String,
    trim: true
  },
  
  // Incident Details
  incidentDate: {
    type: Date,
    required: true
  },
  incidentTime: {
    type: String,
    trim: true
  },
  witnesses: [{
    name: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },
    statement: {
      type: String,
      trim: true
    }
  }],
  
  // Evidence and Attachments
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
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Resolution Details
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterEmployee'
  },
  assignedToName: {
    type: String,
    trim: true
  },
  assignedAt: {
    type: Date
  },
  resolution: {
    type: String,
    trim: true
  },
  resolutionDate: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterEmployee'
  },
  resolvedByName: {
    type: String,
    trim: true
  },
  
  // Status and Workflow
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
    default: 'Submitted'
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  
  // Feedback
  complainantFeedback: {
    type: String,
    trim: true
  },
  satisfactionRating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedbackDate: {
    type: Date
  },
  
  // Follow-up Actions
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
    },
    isInternal: {
      type: Boolean,
      default: true
    }
  }],
  
  // Communication Log
  communications: [{
    type: {
      type: String,
      enum: ['Email', 'Phone', 'SMS', 'In-Person', 'System'],
      required: true
    },
    direction: {
      type: String,
      enum: ['Inbound', 'Outbound'],
      required: true
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
    communicatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    communicatedByName: {
      type: String,
      trim: true
    },
    communicatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Escalation
  escalationLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  escalatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterEmployee'
  },
  escalatedAt: {
    type: Date
  },
  escalationReason: {
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
MasterComplaintSchema.index({ complainant: 1 });
MasterComplaintSchema.index({ category: 1 });
MasterComplaintSchema.index({ priority: 1 });
MasterComplaintSchema.index({ status: 1 });
MasterComplaintSchema.index({ branchId: 1 });
MasterComplaintSchema.index({ incidentDate: 1 });
MasterComplaintSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('MasterComplaint', MasterComplaintSchema);
