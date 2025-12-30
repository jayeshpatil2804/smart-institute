const express = require('express');
const { body, validationResult } = require('express-validator');
const Branch = require('../models/Branch');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all branches (public)
router.get('/', async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true }).populate('headOfBranch', 'firstName lastName email');
    res.json(branches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get branch by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).populate('headOfBranch', 'firstName lastName email');
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.json(branch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new branch (Admin only)
router.post('/', [
  auth,
  authorize('Admin'),
  body('name').notEmpty().withMessage('Branch name is required'),
  body('code').notEmpty().withMessage('Branch code is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.pincode').notEmpty().withMessage('Pincode is required'),
  body('contact.phone').notEmpty().withMessage('Phone number is required'),
  body('contact.email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const branch = new Branch(req.body);
    await branch.save();
    
    res.status(201).json({
      message: 'Branch created successfully',
      branch
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Branch code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update branch (Admin only)
router.put('/:id', [
  auth,
  authorize('Admin'),
  body('name').optional().notEmpty().withMessage('Branch name cannot be empty'),
  body('code').optional().notEmpty().withMessage('Branch code cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json({
      message: 'Branch updated successfully',
      branch
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Branch code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete branch (Admin only)
router.delete('/:id', [auth, authorize('Admin')], async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
