const express = require('express');
const router = express.Router();
const { checkModulePermission } = require('../../middleware/masterAuth');
const MasterResult = require('../../models/MasterResult');

// Apply permission middleware to all routes
router.use(checkModulePermission('results', 'view'));

// Get all results
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, resultStatus, exam, subject, course, semester } = req.query;
    const user = req.user;
    
    let filter = {};
    
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    }
    
    if (resultStatus) filter.resultStatus = resultStatus;
    if (exam) filter.exam = exam;
    if (subject) filter.subject = subject;
    if (course) filter.course = course;
    if (semester) filter.semester = semester;
    
    if (search) {
      filter.$or = [
        { 'student.firstName': { $regex: search, $options: 'i' } },
        { 'student.lastName': { $regex: search, $options: 'i' } }
      ];
    }
    
    const results = await MasterResult.find(filter)
      .populate('student', 'firstName lastName enrollmentNumber')
      .populate('exam', 'title examDate')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MasterResult.countDocuments(filter);
    
    res.json({
      results,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create result
router.post('/', checkModulePermission('results', 'create'), async (req, res) => {
  try {
    const result = new MasterResult({
      ...req.body,
      createdBy: req.user._id,
      branchId: req.user.role === 'Branch Admin' ? req.user.branchId : req.body.branchId
    });
    
    await result.save();
    res.status(201).json(result);
  } catch (error) {
    console.error('Create result error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update result
router.put('/:id', checkModulePermission('results', 'edit'), async (req, res) => {
  try {
    const result = await MasterResult.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    
    if (req.user.role === 'Branch Admin' && result.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot edit result from other branch' });
    }
    
    Object.assign(result, req.body);
    await result.save();
    res.json(result);
  } catch (error) {
    console.error('Update result error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete result
router.delete('/:id', checkModulePermission('results', 'delete'), async (req, res) => {
  try {
    const result = await MasterResult.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    
    if (req.user.role === 'Branch Admin' && result.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot delete result from other branch' });
    }
    
    await MasterResult.findByIdAndDelete(req.params.id);
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
