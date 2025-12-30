const express = require('express');
const router = express.Router();
const { checkModulePermission } = require('../../middleware/masterAuth');
const MasterExam = require('../../models/MasterExam');

// Apply permission middleware to all routes
router.use(checkModulePermission('exams', 'view'));

// Get all exams
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, examType, status, subject, course, semester } = req.query;
    const user = req.user;
    
    let filter = {};
    
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    }
    
    if (examType) filter.examType = examType;
    if (status) filter.status = status;
    if (subject) filter.subject = subject;
    if (course) filter.course = course;
    if (semester) filter.semester = semester;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const exams = await MasterExam.find(filter)
      .populate('subject', 'name code')
      .populate('course', 'name code')
      .sort({ examDate: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MasterExam.countDocuments(filter);
    
    res.json({
      exams,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create exam
router.post('/', checkModulePermission('exams', 'create'), async (req, res) => {
  try {
    const exam = new MasterExam({
      ...req.body,
      createdBy: req.user._id,
      branchId: req.user.role === 'Branch Admin' ? req.user.branchId : req.body.branchId
    });
    
    await exam.save();
    res.status(201).json(exam);
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update exam
router.put('/:id', checkModulePermission('exams', 'edit'), async (req, res) => {
  try {
    const exam = await MasterExam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    if (req.user.role === 'Branch Admin' && exam.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot edit exam from other branch' });
    }
    
    Object.assign(exam, req.body);
    await exam.save();
    res.json(exam);
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete exam
router.delete('/:id', checkModulePermission('exams', 'delete'), async (req, res) => {
  try {
    const exam = await MasterExam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    if (req.user.role === 'Branch Admin' && exam.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot delete exam from other branch' });
    }
    
    await MasterExam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
