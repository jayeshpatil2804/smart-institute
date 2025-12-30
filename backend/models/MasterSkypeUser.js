const mongoose = require('mongoose');

const MasterSkypeUserSchema = new mongoose.Schema({
  // Basic Information
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  skypeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  
  // User Type and Role
  userType: {
    type: String,
    enum: ['Student', 'Faculty', 'Staff', 'Admin', 'Guest'],
    required: true
  },
  role: {
    type: String,
    enum: ['Teacher', 'Student', 'Coordinator', 'Admin', 'Support'],
    required: true
  },
  
  // Associated User
  associatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'associatedUserModel'
  },
  associatedUserModel: {
    type: String,
    enum: ['MasterStudent', 'MasterEmployee', 'User']
  },
  associatedUserName: {
    type: String,
    trim: true
  },
  
  // Academic Information (if applicable)
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  department: {
    type: String,
    trim: true
  },
  
  // Skype Account Details
  accountStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Pending'],
    default: 'Active'
  },
  accountType: {
    type: String,
    enum: ['Personal', 'Business', 'Education'],
    default: 'Education'
  },
  subscriptionType: {
    type: String,
    enum: ['Free', 'Premium', 'Education'],
    default: 'Education'
  },
  
  // Contact Information
  phone: {
    type: String,
    trim: true
  },
  alternateEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  // Profile Information
  profilePicture: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  timezone: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    trim: true
  },
  
  // Availability and Schedule
  availability: {
    type: String,
    enum: ['Available', 'Busy', 'Away', 'Do Not Disturb', 'Invisible'],
    default: 'Available'
  },
  workingHours: {
    from: {
      type: String,
      trim: true
    },
    to: {
      type: String,
      trim: true
    },
    timezone: {
      type: String,
      trim: true
    }
  },
  availableDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  
  // Groups and Channels
  groups: [{
    groupId: {
      type: String,
      required: true,
      trim: true
    },
    groupName: {
      type: String,
      required: true,
      trim: true
    },
    groupType: {
      type: String,
      enum: ['Course', 'Department', 'Project', 'General', 'Admin'],
      required: true
    },
    role: {
      type: String,
      enum: ['Admin', 'Member', 'Moderator'],
      default: 'Member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Permissions and Access
  permissions: {
    canCreateGroups: {
      type: Boolean,
      default: false
    },
    canAddMembers: {
      type: Boolean,
      default: false
    },
    canScheduleCalls: {
      type: Boolean,
      default: false
    },
    canRecordCalls: {
      type: Boolean,
      default: false
    },
    canShareScreen: {
      type: Boolean,
      default: true
    },
    canTransferFiles: {
      type: Boolean,
      default: true
    }
  },
  
  // Usage Statistics
  lastLogin: {
    type: Date
  },
  totalCalls: {
    type: Number,
    default: 0
  },
  totalMessages: {
    type: Number,
    default: 0
  },
  totalFilesShared: {
    type: Number,
    default: 0
  },
  averageCallDuration: {
    type: Number,
    default: 0
  },
  
  // Device Information
  devices: [{
    deviceType: {
      type: String,
      enum: ['Desktop', 'Mobile', 'Tablet', 'Web'],
      required: true
    },
    deviceName: {
      type: String,
      trim: true
    },
    lastUsed: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Integration Details
  integrations: [{
    platform: {
      type: String,
      enum: ['Microsoft Teams', 'Zoom', 'Google Meet', 'Slack', 'Other'],
      required: true
    },
    integrationId: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    configuredAt: {
      type: Date
    }
  }],
  
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  
  // Notes and Remarks
  notes: {
    type: String,
    trim: true
  },
  internalRemarks: {
    type: String,
    trim: true
  },
  
  // Status and Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Privacy Settings
  privacySettings: {
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    allowDirectMessages: {
      type: Boolean,
      default: true
    },
    showProfilePicture: {
      type: Boolean,
      default: true
    },
    allowGroupInvites: {
      type: Boolean,
      default: true
    }
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
MasterSkypeUserSchema.index({ displayName: 1 });
MasterSkypeUserSchema.index({ email: 1 });
MasterSkypeUserSchema.index({ userType: 1 });
MasterSkypeUserSchema.index({ role: 1 });
MasterSkypeUserSchema.index({ associatedUser: 1 });
MasterSkypeUserSchema.index({ course: 1 });
MasterSkypeUserSchema.index({ branch: 1 });
MasterSkypeUserSchema.index({ accountStatus: 1 });
MasterSkypeUserSchema.index({ isActive: 1 });

module.exports = mongoose.model('MasterSkypeUser', MasterSkypeUserSchema);
