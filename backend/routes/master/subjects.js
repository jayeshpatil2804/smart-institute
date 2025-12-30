const express = require('express');
const router = express.Router();
const { checkModulePermission, checkBranchAccess } = require('../../middleware/masterAuth');
const MasterSubject = require('../../models/MasterSubject');
const Course = require('../../models/Course');

// Apply permission middleware to all routes
router.use(checkModulePermission('subjects', 'view'));

// Get all subjects with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, course, semester, department, type, status, branch } = req.query;
    const user = req.user;
    
    // Build filter
    let filter = {};
    
    // Branch Admin can only see their own branch subjects
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    } else if (branch) {
      filter.branchId = branch;
    }
    
    if (course) filter.course = course;
    if (semester) filter.semester = semester;
    if (department) filter.department = department;
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    
    const subjects = await MasterSubject.find(filter)
      .populate('course', 'name code')
      .populate('faculty', 'firstName lastName email')
      .sort({ course: 1, semester: 1, name: 1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MasterSubject.countDocuments(filter);
    
    res.json({
      subjects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single subject
router.get('/:id', async (req, res) => {
  try {
    const subject = await MasterSubject.findById(req.params.id)
      .populate('course', 'name code duration')
      .populate('faculty', 'firstName lastName email employeeId')
      .populate('prerequisites', 'name code');
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && subject.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot access subject from other branch' });
    }
    
    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new subject
router.post('/', checkModulePermission('subjects', 'create'), async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      course,
      semester,
      department,
      credits,
      lectureHours,
      practicalHours,
      tutorialHours,
      type,
      prerequisites,
      faculty,
      syllabus,
      assessment,
      referenceBooks,
      branchId
    } = req.body;
    
    // Check if subject already exists
    const existingSubject = await MasterSubject.findOne({ code });
    
    if (existingSubject) {
      return res.status(400).json({ 
        message: 'Subject with this code already exists' 
      });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && branchId !== req.user.branchId.toString()) {
      return res.status(403).json({ 
        message: 'Forbidden: Branch Admin can only create subjects for their own branch' 
      });
    }
    
    const subject = new MasterSubject({
      name,
      code,
      description,
      course,
      semester,
      department,
      credits,
      lectureHours,
      practicalHours,
      tutorialHours,
      type,
      prerequisites: prerequisites || [],
      faculty,
      syllabus: syllabus || [],
      assessment,
      referenceBooks: referenceBooks || [],
      createdBy: req.user._id,
      branchId
    });
    
    await subject.save();
    
    const populatedSubject = await MasterSubject.findById(subject._id)
      .populate('course', 'name code')
      .populate('faculty', 'firstName lastName email');
    
    res.status(201).json(populatedSubject);
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update subject
router.put('/:id', checkModulePermission('subjects', 'edit'), async (req, res) => {
  try {
    const subject = await MasterSubject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && subject.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot edit subject from other branch' });
    }
    
    const {
      name,
      description,
      course,
      semester,
      department,
      credits,
      lectureHours,
      practicalHours,
      tutorialHours,
      type,
      prerequisites,
      faculty,
      syllabus,
      assessment,
      referenceBooks,
      status
    } = req.body;
    
    // Update subject
    Object.assign(subject, {
      name,
      description,
      course,
      semester,
      department,
      credits,
      lectureHours,
      practicalHours,
      tutorialHours,
      type,
      prerequisites,
      faculty,
      syllabus,
      assessment,
      referenceBooks,
      status
    });
    
    await subject.save();
    
    const populatedSubject = await MasterSubject.findById(subject._id)
      .populate('course', 'name code')
      .populate('faculty', 'firstName lastName email')
      .populate('prerequisites', 'name code');
    
    res.json(populatedSubject);
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete subject
router.delete('/:id', checkModulePermission('subjects', 'delete'), async (req, res) => {
  try {
    const subject = await MasterSubject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && subject.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot delete subject from other branch' });
    }
    
    await MasterSubject.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get subjects by course
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;
    
    let filter = { course: courseId };
    
    // Branch Admin can only see their own branch subjects
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    }
    
    const subjects = await MasterSubject.find(filter)
      .sort({ semester: 1, name: 1 });
    
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects by course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get subjects by semester
router.get('/semester/:semester', async (req, res) => {
  try {
    const { semester } = req.params;
    const { course } = req.query;
    const user = req.user;
    
    let filter = { semester };
    if (course) filter.course = course;
    
    // Branch Admin can only see their own branch subjects
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    }
    
    const subjects = await MasterSubject.find(filter)
      .populate('course', 'name code')
      .sort({ name: 1 });
    
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects by semester error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
