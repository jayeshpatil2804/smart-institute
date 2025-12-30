const express = require('express');
const router = express.Router();
const { checkModulePermission } = require('../../middleware/masterAuth');
const MasterTopper = require('../../models/MasterTopper');

// Apply permission middleware to all routes
router.use(checkModulePermission('results', 'view'));

// Get all toppers
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, achievementType, category, academicYear, status } = req.query;
    const user = req.user;
    
    let filter = {};
    
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    }
    
    if (achievementType) filter.achievementType = achievementType;
    if (category) filter.category = category;
    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const toppers = await MasterTopper.find(filter)
      .populate('student', 'firstName lastName enrollmentNumber')
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MasterTopper.countDocuments(filter);
    
    res.json({
      toppers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get toppers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create topper
router.post('/', checkModulePermission('results', 'create'), async (req, res) => {
  try {
    const topper = new MasterTopper({
      ...req.body,
      createdBy: req.user._id,
      branchId: req.user.role === 'Branch Admin' ? req.user.branchId : req.body.branchId
    });
    
    await topper.save();
    res.status(201).json(topper);
  } catch (error) {
    console.error('Create topper error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update topper
router.put('/:id', checkModulePermission('results', 'edit'), async (req, res) => {
  try {
    const topper = await MasterTopper.findById(req.params.id);
    if (!topper) {
      return res.status(404).json({ message: 'Topper not found' });
    }
    
    if (req.user.role === 'Branch Admin' && topper.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot edit topper from other branch' });
    }
    
    Object.assign(topper, req.body);
    await topper.save();
    res.json(topper);
  } catch (error) {
    console.error('Update topper error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete topper
router.delete('/:id', checkModulePermission('results', 'delete'), async (req, res) => {
  try {
    const topper = await MasterTopper.findById(req.params.id);
    if (!topper) {
      return res.status(404).json({ message: 'Topper not found' });
    }
    
    if (req.user.role === 'Branch Admin' && topper.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot delete topper from other branch' });
    }
    
    await MasterTopper.findByIdAndDelete(req.params.id);
    res.json({ message: 'Topper deleted successfully' });
  } catch (error) {
    console.error('Delete topper error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
