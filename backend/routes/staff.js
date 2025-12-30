const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get all staff (excluding students)
router.get('/', auth, async (req, res) => {
  try {
    let query = { 
      role: { $ne: 'Student' },
      isActive: true 
    };
    
    // If Branch Admin, only show staff from their branch
    if (req.user.role === 'Branch Admin') {
      query.branch = req.user.branch._id;
    }
    
    const staff = await User.find(query)
      .populate('branch', 'name code')
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get staff by role
router.get('/role/:role', auth, async (req, res) => {
  try {
    let query = { 
      role: req.params.role,
      isActive: true 
    };
    
    // If Branch Admin, only show staff from their branch
    if (req.user.role === 'Branch Admin') {
      query.branch = req.user.branch._id;
    }
    
    const staff = await User.find(query)
      .populate('branch', 'name code')
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(staff);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
