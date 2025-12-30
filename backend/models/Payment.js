const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  admissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admission',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Cheque', 'Online Transfer', 'UPI', 'Credit Card', 'Debit Card', 'Razorpay'],
    required: true
  },
  paymentType: {
    type: String,
    enum: ['ONE_TIME', 'EMI', 'REGISTRATION'],
    required: true
  },
  // Razorpay specific fields
  razorpayOrderId: {
    type: String,
    trim: true
  },
  razorpayPaymentId: {
    type: String,
    trim: true
  },
  razorpaySignature: {
    type: String,
    trim: true
  },
  // Legacy transaction field
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  chequeNumber: String,
  bankName: String,
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Completed'
  },
  description: {
    type: String,
    required: true
  },
  receiptNumber: {
    type: String,
    unique: true,
    required: true
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  installmentNumber: {
    type: Number,
    default: 1
  },
  dueDate: Date,
  lateFees: {
    type: Number,
    default: 0
  },
  // Payment verification status
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date
}, {
  timestamps: true
});

// Indexes for better performance
paymentSchema.index({ admissionId: 1 });
paymentSchema.index({ student: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ status: 1 });

// Generate receipt number automatically
paymentSchema.pre('save', async function(next) {
  if (!this.receiptNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      paymentDate: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.receiptNumber = `PAY${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
