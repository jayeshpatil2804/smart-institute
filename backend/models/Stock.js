const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  itemCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Books', 'Stationery', 'Equipment', 'Furniture', 'Electronics', 'Other']
  },
  description: {
    type: String
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0
  },
  minimumStock: {
    type: Number,
    required: true,
    default: 5
  },
  unit: {
    type: String,
    required: true,
    enum: ['Pieces', 'Boxes', 'Kgs', 'Liters', 'Sets'],
    default: 'Pieces'
  },
  unitPrice: {
    type: Number,
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  supplier: {
    name: String,
    contact: String,
    email: String,
    address: String
  },
  transactions: [{
    type: {
      type: String,
      enum: ['In', 'Out'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    reference: String,
    remarks: String,
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    balance: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastUpdated and currentStock on transactions
stockSchema.pre('save', function(next) {
  if (this.isModified('transactions')) {
    this.lastUpdated = new Date();
    // Recalculate current stock from transactions
    const totalIn = this.transactions
      .filter(t => t.type === 'In')
      .reduce((sum, t) => sum + t.quantity, 0);
    const totalOut = this.transactions
      .filter(t => t.type === 'Out')
      .reduce((sum, t) => sum + t.quantity, 0);
    this.currentStock = totalIn - totalOut;
  }
  next();
});

module.exports = mongoose.model('Stock', stockSchema);
