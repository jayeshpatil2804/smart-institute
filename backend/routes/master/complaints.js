const express = require('express');
const router = express.Router();
const { checkModulePermission } = require('../../middleware/masterAuth');
const MasterComplaint = require('../../models/MasterComplaint');

// Apply permission middleware to all routes
router.use(checkModulePermission('complaints', 'view'));

// Get all complaints
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, category, priority, status, branch } = req.query;
    const user = req.user;
    
    let filter = {};
    
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    }
    
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { complainantName: { $regex: search, $options: 'i' } },
        { complaintNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const complaints = await MasterComplaint.find(filter)
      .populate('branch', 'name city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MasterComplaint.countDocuments(filter);
    
    res.json({
      complaints,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create complaint
router.post('/', checkModulePermission('complaints', 'create'), async (req, res) => {
  try {
    const complaint = new MasterComplaint({
      ...req.body,
      createdBy: req.user._id,
      branchId: req.user.role === 'Branch Admin' ? req.user.branchId : req.body.branchId
    });
    
    await complaint.save();
    res.status(201).json(complaint);
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update complaint
router.put('/:id', checkModulePermission('complaints', 'edit'), async (req, res) => {
  try {
    const complaint = await MasterComplaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    if (req.user.role === 'Branch Admin' && complaint.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot edit complaint from other branch' });
    }
    
    Object.assign(complaint, req.body);
    await complaint.save();
    res.json(complaint);
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete complaint
router.delete('/:id', checkModulePermission('complaints', 'delete'), async (req, res) => {
  try {
    const complaint = await MasterComplaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    if (req.user.role === 'Branch Admin' && complaint.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot delete complaint from other branch' });
    }
    
    await MasterComplaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
