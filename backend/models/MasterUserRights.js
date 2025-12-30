const mongoose = require('mongoose');

const MasterUserRightsSchema = new mongoose.Schema({
  // User Information
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
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  userRole: {
    type: String,
    enum: ['Admin', 'Branch Admin', 'Faculty', 'Staff', 'Student'],
    required: true
  },
  
  // Branch Assignment
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
  
  // Module Permissions
  permissions: {
    // Student Management
    students: {
      view: {
        type: Boolean,
        default: false
      },
      create: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      },
      ownBranchOnly: {
        type: Boolean,
        default: true
      }
    },
    
    // Employee Management
    employees: {
      view: {
        type: Boolean,
        default: false
      },
      create: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      },
      ownBranchOnly: {
        type: Boolean,
        default: true
      }
    },
    
    // Subject Management
    subjects: {
      view: {
        type: Boolean,
        default: false
      },
      create: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      },
      ownBranchOnly: {
        type: Boolean,
        default: true
      }
    },
    
    // Material Management
    materials: {
      view: {
        type: Boolean,
        default: false
      },
      create: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      },
      ownBranchOnly: {
        type: Boolean,
        default: true
      }
    },
    
    // Exam Management
    exams: {
      view: {
        type: Boolean,
        default: false
      },
      create: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      },
      ownBranchOnly: {
        type: Boolean,
        default: true
      }
    },
    
    // Result Management
    results: {
      view: {
        type: Boolean,
        default: false
      },
      create: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      },
      ownBranchOnly: {
        type: Boolean,
        default: true
      }
    },
    
    // News Management
    news: {
      view: {
        type: Boolean,
        default: false
      },
      create: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      },
      ownBranchOnly: {
        type: Boolean,
        default: true
      }
    },
    
    // Complaint Management
    complaints: {
      view: {
        type: Boolean,
        default: false
      },
      create: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      },
      ownBranchOnly: {
        type: Boolean,
        default: true
      }
    },
    
    // Feedback Management
    feedback: {
      view: {
        type: Boolean,
        default: false
      },
      create: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      },
      ownBranchOnly: {
        type: Boolean,
        default: true
      }
    },
    
    // User Rights Management
    userRights: {
      view: {
        type: Boolean,
        default: false
      },
      create: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      },
      ownBranchOnly: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Special Permissions
  specialPermissions: [{
    module: {
      type: String,
      required: true,
      trim: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    granted: {
      type: Boolean,
      required: true
    },
    reason: {
      type: String,
      trim: true
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    grantedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date
    }
  }],
  
  // Access Restrictions
  accessRestrictions: {
    timeBased: {
      type: Boolean,
      default: false
    },
    accessFrom: {
      type: String
    },
    accessTo: {
      type: String
    },
    weekdaysOnly: {
      type: Boolean,
      default: false
    },
    ipRestriction: {
      type: Boolean,
      default: false
    },
    allowedIPs: [{
      type: String,
      trim: true
    }]
  },
  
  // Status and Validity
  isActive: {
    type: Boolean,
    default: true
  },
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  
  // Audit Information
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedByName: {
    type: String,
    trim: true
  },
  modificationReason: {
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
MasterUserRightsSchema.index({ user: 1 });
MasterUserRightsSchema.index({ userEmail: 1 });
MasterUserRightsSchema.index({ userRole: 1 });
MasterUserRightsSchema.index({ branch: 1 });
MasterUserRightsSchema.index({ isActive: 1 });
MasterUserRightsSchema.index({ 'permissions.students.view': 1 });
MasterUserRightsSchema.index({ 'permissions.employees.view': 1 });

// Compound index for unique user-branch combination
MasterUserRightsSchema.index({ user: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model('MasterUserRights', MasterUserRightsSchema);
