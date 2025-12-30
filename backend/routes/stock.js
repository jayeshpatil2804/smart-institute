const express = require('express');
const { body, validationResult } = require('express-validator');
const Stock = require('../models/Stock');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all stock items
router.get('/', auth, async (req, res) => {
  try {
    let query = { isActive: true };
    
    // If Stock Admin or Branch Admin, filter by branch
    if (req.user.role !== 'Admin') {
      query.branch = req.user.branch._id;
    }
    
    const stockItems = await Stock.find(query)
      .populate('branch', 'name code')
      .sort({ itemName: 1 });
    
    res.json(stockItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stock item by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const stockItem = await Stock.findById(req.params.id)
      .populate('branch', 'name code address')
      .populate('transactions.handledBy', 'firstName lastName');
    
    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }
    
    res.json(stockItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new stock item
router.post('/', [
  auth,
  authorize('Admin', 'Branch Admin', 'Stock Admin'),
  body('itemName').notEmpty().withMessage('Item name is required'),
  body('itemCode').notEmpty().withMessage('Item code is required'),
  body('category').isIn(['Books', 'Stationery', 'Equipment', 'Furniture', 'Electronics', 'Other']).withMessage('Invalid category'),
  body('currentStock').isNumeric().withMessage('Current stock must be a number'),
  body('minimumStock').isNumeric().withMessage('Minimum stock must be a number'),
  body('unitPrice').isNumeric().withMessage('Unit price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If not Admin, set their branch
    if (req.user.role !== 'Admin') {
      req.body.branch = req.user.branch._id;
    }

    const stockItem = new Stock(req.body);
    await stockItem.save();
    
    await stockItem.populate('branch', 'name code');
    
    res.status(201).json({
      message: 'Stock item created successfully',
      stockItem
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Item code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update stock item
router.put('/:id', [
  auth,
  authorize('Admin', 'Branch Admin', 'Stock Admin'),
  body('itemName').optional().notEmpty().withMessage('Item name cannot be empty'),
  body('itemCode').optional().notEmpty().withMessage('Item code cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const stockItem = await Stock.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('branch', 'name code');

    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    res.json({
      message: 'Stock item updated successfully',
      stockItem
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Item code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Add stock transaction
router.post('/:id/transaction', [
  auth,
  authorize('Admin', 'Branch Admin', 'Stock Admin'),
  body('type').isIn(['In', 'Out']).withMessage('Transaction type must be In or Out'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('reference').notEmpty().withMessage('Reference is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const stockItem = await Stock.findById(req.params.id);
    if (!stockItem) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    const transaction = {
      ...req.body,
      date: new Date(),
      handledBy: req.user._id,
      balance: stockItem.currentStock + (req.body.type === 'In' ? req.body.quantity : -req.body.quantity)
    };

    stockItem.transactions.push(transaction);
    await stockItem.save();

    res.json({
      message: 'Transaction added successfully',
      stockItem
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock items
router.get('/low-stock/alerts', auth, async (req, res) => {
  try {
    let query = { 
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    };
    
    // If not Admin, filter by branch
    if (req.user.role !== 'Admin') {
      query.branch = req.user.branch._id;
    }
    
    const lowStockItems = await Stock.find(query)
      .populate('branch', 'name code')
      .sort({ currentStock: 1 });
    
    res.json(lowStockItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
