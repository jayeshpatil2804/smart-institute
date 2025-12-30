const mongoose = require('mongoose');

const MasterMaterialSchema = new mongoose.Schema({
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
  
  // Material Details
  materialType: {
    type: String,
    enum: ['PDF', 'Video', 'Presentation', 'Document', 'Image', 'Audio', 'Link', 'Assignment'],
    required: true
  },
  category: {
    type: String,
    enum: ['Study Material', 'Assignment', 'Reference', 'Notes', 'Question Paper', 'Solution', 'Other'],
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
  
  // File Information
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
  
  // External Link (if material type is Link)
  externalLink: {
    type: String,
    trim: true
  },
  
  // Access Control
  accessType: {
    type: String,
    enum: ['Public', 'Students Only', 'Faculty Only', 'Specific Branch'],
    default: 'Students Only'
  },
  allowedBranches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  }],
  
  // Visibility and Schedule
  isVisible: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  
  // Download and View Tracking
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  
  // Tags for Search
  tags: [{
    type: String,
    trim: true
  }],
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Draft', 'Archived'],
    default: 'Active'
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
MasterMaterialSchema.index({ title: 1 });
MasterMaterialSchema.index({ subject: 1 });
MasterMaterialSchema.index({ course: 1 });
MasterMaterialSchema.index({ semester: 1 });
MasterMaterialSchema.index({ branchId: 1 });
MasterMaterialSchema.index({ materialType: 1 });
MasterMaterialSchema.index({ category: 1 });
MasterMaterialSchema.index({ status: 1 });
MasterMaterialSchema.index({ tags: 1 });

module.exports = mongoose.model('MasterMaterial', MasterMaterialSchema);
