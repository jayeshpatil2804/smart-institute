const express = require('express');
const router = express.Router();
const { checkModulePermission } = require('../../middleware/masterAuth');
const MasterExamRequest = require('../../models/MasterExamRequest');

// Apply permission middleware to all routes
router.use(checkModulePermission('exams', 'view'));

// Get all exam requests
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, requestType, status, urgency, course, semester } = req.query;
    const user = req.user;
    
    let filter = {};
    
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    }
    
    if (requestType) filter.requestType = requestType;
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    if (course) filter.course = course;
    if (semester) filter.semester = semester;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const requests = await MasterExamRequest.find(filter)
      .populate('student', 'firstName lastName enrollmentNumber')
      .populate('course', 'name code')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MasterExamRequest.countDocuments(filter);
    
    res.json({
      requests,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get exam requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create exam request
router.post('/', checkModulePermission('exams', 'create'), async (req, res) => {
  try {
    const request = new MasterExamRequest({
      ...req.body,
      createdBy: req.user._id,
      branchId: req.user.role === 'Branch Admin' ? req.user.branchId : req.body.branchId
    });
    
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    console.error('Create exam request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update exam request
router.put('/:id', checkModulePermission('exams', 'edit'), async (req, res) => {
  try {
    const request = await MasterExamRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Exam request not found' });
    }
    
    if (req.user.role === 'Branch Admin' && request.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot edit exam request from other branch' });
    }
    
    Object.assign(request, req.body);
    await request.save();
    res.json(request);
  } catch (error) {
    console.error('Update exam request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete exam request
router.delete('/:id', checkModulePermission('exams', 'delete'), async (req, res) => {
  try {
    const request = await MasterExamRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Exam request not found' });
    }
    
    if (req.user.role === 'Branch Admin' && request.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot delete exam request from other branch' });
    }
    
    await MasterExamRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exam request deleted successfully' });
  } catch (error) {
    console.error('Delete exam request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
