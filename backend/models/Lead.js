const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  interestedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  leadSource: {
    type: String,
    enum: ['Website', 'Phone Call', 'Walk-in', 'Referral', 'Social Media', 'Advertisement', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Interested', 'Not Interested', 'Converted', 'Closed'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  followUpDate: Date,
  lastContactDate: Date,
  nextFollowUpDate: Date,
  notes: [{
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  convertedToStudent: {
    type: Boolean,
    default: false
  },
  conversionDate: Date,
  enrolledStudentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);
