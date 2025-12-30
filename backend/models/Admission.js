const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalDetails: {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{10}$/
    },
    emailId: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other']
    },
    photoUrl: {
      type: String,
      default: null
    }
  },
  address: {
    addressLine1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    addressLine2: {
      type: String,
      trim: true,
      maxlength: 200
    },
    landmark: {
      type: String,
      trim: true,
      maxlength: 100
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{6}$/
    },
    state: {
      type: String,
      required: true,
      trim: true
    }
  },
  courseDetails: {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true
    },
    courseDuration: {
      type: String,
      required: true
    },
    courseFees: {
      type: Number,
      required: true,
      min: 0
    }
  },
  paymentDetails: {
    paymentType: {
      type: String,
      required: true,
      enum: ['ONE_TIME', 'EMI'],
      default: 'ONE_TIME'
    },
    totalFees: {
      type: Number,
      required: true,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    pendingAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentStatus: {
      type: String,
      default: 'PENDING',
      enum: ['PAID', 'PARTIAL', 'PENDING']
    },
    registrationFees: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMode: {
      type: String,
      required: true,
      enum: ['Cash', 'Online', 'PhonePe', 'Google Pay', 'Razorpay', 'Other']
    },
    transactionId: {
      type: String,
      trim: true
    },
    razorpayOrderId: {
      type: String,
      trim: true
    },
    numberOfInstallments: {
      type: Number,
      min: 1,
      max: 12
    },
    installmentAmount: {
      type: Number,
      min: 0
    }
  },
  receiptNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Inactive', 'Completed', 'Cancelled']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
admissionSchema.index({ studentId: 1 });
admissionSchema.index({ courseId: 1 });
admissionSchema.index({ branchId: 1 });
admissionSchema.index({ createdAt: -1 });

// Pre-save middleware to generate receipt number
admissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${year + 1}-01-01`)
      }
    });
    this.receiptNumber = `ADM-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Admission', admissionSchema);
