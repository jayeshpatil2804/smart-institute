const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  admissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admission',
    required: true
  },
  installmentNo: {
    type: Number,
    required: true,
    min: 1
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    default: 'UNPAID',
    enum: ['PAID', 'UNPAID', 'OVERDUE']
  },
  paidDate: {
    type: Date
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  lateFees: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
installmentSchema.index({ admissionId: 1 });
installmentSchema.index({ dueDate: 1 });
installmentSchema.index({ status: 1 });
installmentSchema.index({ admissionId: 1, installmentNo: 1 }, { unique: true });

// Pre-save middleware to calculate total amount
installmentSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('lateFees')) {
    this.totalAmount = this.amount + this.lateFees;
  }
  next();
});

module.exports = mongoose.model('Installment', installmentSchema);
