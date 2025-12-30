const express = require('express');
const router = express.Router();
const { checkModulePermission } = require('../../middleware/masterAuth');
const MasterFeedback = require('../../models/MasterFeedback');

// Apply permission middleware to all routes
router.use(checkModulePermission('feedback', 'view'));

// Get all feedback
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, feedbackType, status, course, semester } = req.query;
    const user = req.user;
    
    let filter = {};
    
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    }
    
    if (feedbackType) filter.feedbackType = feedbackType;
    if (status) filter.status = status;
    if (course) filter.course = course;
    if (semester) filter.semester = semester;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { respondentName: { $regex: search, $options: 'i' } },
        { feedbackNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const feedback = await MasterFeedback.find(filter)
      .populate('course', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MasterFeedback.countDocuments(filter);
    
    res.json({
      feedback,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create feedback
router.post('/', checkModulePermission('feedback', 'create'), async (req, res) => {
  try {
    const feedback = new MasterFeedback({
      ...req.body,
      createdBy: req.user._id,
      branchId: req.user.role === 'Branch Admin' ? req.user.branchId : req.body.branchId
    });
    
    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update feedback
router.put('/:id', checkModulePermission('feedback', 'edit'), async (req, res) => {
  try {
    const feedback = await MasterFeedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    if (req.user.role === 'Branch Admin' && feedback.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot edit feedback from other branch' });
    }
    
    Object.assign(feedback, req.body);
    await feedback.save();
    res.json(feedback);
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete feedback
router.delete('/:id', checkModulePermission('feedback', 'delete'), async (req, res) => {
  try {
    const feedback = await MasterFeedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    if (req.user.role === 'Branch Admin' && feedback.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot delete feedback from other branch' });
    }
    
    await MasterFeedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
