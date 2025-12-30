const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date
  },
  enrollmentStatus: {
    type: String,
    enum: ['ENROLLED_NOT_ADMITTED', 'ADMITTED'],
    default: 'ENROLLED_NOT_ADMITTED'
  },
  admissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admission',
    default: null
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Dropped', 'On Hold'],
    default: 'Active'
  },
  feesPaid: {
    type: Number,
    default: 0
  },
  totalFees: {
    type: Number,
    required: true
  },
  balanceFees: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Completed'],
    default: 'Pending'
  },
  attendance: [{
    date: Date,
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late']
    },
    remarks: String
  }],
  grades: [{
    exam: String,
    score: Number,
    maxScore: Number,
    grade: String,
    date: Date
  }],
  certificates: [{
    name: String,
    issuedDate: Date,
    certificateUrl: String
  }],
  remarks: String,
  enrolledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
