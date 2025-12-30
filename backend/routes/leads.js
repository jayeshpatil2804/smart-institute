const express = require('express');
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all leads
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Filter by role
    if (req.user.role === 'Marketing Staff') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'Branch Admin') {
      query.branch = req.user.branch._id;
    }
    
    const leads = await Lead.find(query)
      .populate('interestedCourse', 'title code')
      .populate('assignedTo', 'firstName lastName')
      .populate('branch', 'name code')
      .sort({ createdAt: -1 });
    
    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get lead by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('interestedCourse', 'title code description fees')
      .populate('assignedTo', 'firstName lastName email')
      .populate('branch', 'name code address')
      .populate('notes.addedBy', 'firstName lastName');
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new lead
router.post('/', [
  auth,
  authorize('Admin', 'Branch Admin', 'Marketing Staff', 'Reception'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('leadSource').isIn(['Website', 'Phone Call', 'Walk-in', 'Referral', 'Social Media', 'Advertisement', 'Other']).withMessage('Invalid lead source'),
  body('branch').notEmpty().withMessage('Branch is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lead = new Lead(req.body);
    await lead.save();
    
    await lead.populate([
      { path: 'interestedCourse', select: 'title code' },
      { path: 'assignedTo', select: 'firstName lastName' },
      { path: 'branch', select: 'name code' }
    ]);
    
    res.status(201).json({
      message: 'Lead created successfully',
      lead
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update lead
router.put('/:id', [
  auth,
  authorize('Admin', 'Branch Admin', 'Marketing Staff'),
  body('status').optional().isIn(['New', 'Contacted', 'Interested', 'Not Interested', 'Converted', 'Closed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('interestedCourse', 'title code')
     .populate('assignedTo', 'firstName lastName')
     .populate('branch', 'name code');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({
      message: 'Lead updated successfully',
      lead
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add note to lead
router.post('/:id/notes', [
  auth,
  authorize('Admin', 'Branch Admin', 'Marketing Staff'),
  body('note').notEmpty().withMessage('Note is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          notes: {
            note: req.body.note,
            addedBy: req.user._id,
            date: new Date()
          }
        }
      },
      { new: true }
    ).populate('notes.addedBy', 'firstName lastName');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({
      message: 'Note added successfully',
      lead
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
