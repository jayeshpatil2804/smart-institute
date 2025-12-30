const express = require('express');
const router = express.Router();
const { checkModulePermission, checkBranchAccess } = require('../../middleware/masterAuth');
const MasterStudent = require('../../models/MasterStudent');
const Course = require('../../models/Course');
const Branch = require('../../models/Branch');

// Apply permission middleware to all routes
router.use(checkModulePermission('students', 'view'));

// Get all students with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, course, branch, semester, status } = req.query;
    const user = req.user;
    
    // Build filter
    let filter = {};
    
    // Branch Admin can only see their own branch students
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    } else if (branch) {
      filter.branchId = branch;
    }
    
    if (course) filter.course = course;
    if (semester) filter.semester = semester;
    if (status) filter.status = status;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const students = await MasterStudent.find(filter)
      .populate('course', 'name code')
      .populate('branch', 'name city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MasterStudent.countDocuments(filter);
    
    res.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single student
router.get('/:id', async (req, res) => {
  try {
    const student = await MasterStudent.findById(req.params.id)
      .populate('course', 'name code duration')
      .populate('branch', 'name city state address');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && student.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot access student from other branch' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new student
router.post('/', checkModulePermission('students', 'create'), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      enrollmentNumber,
      course,
      branch,
      semester,
      address,
      parentName,
      parentPhone,
      parentEmail
    } = req.body;
    
    // Check if student already exists
    const existingStudent = await MasterStudent.findOne({
      $or: [{ email }, { enrollmentNumber }]
    });
    
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this email or enrollment number already exists' 
      });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && branch !== req.user.branchId.toString()) {
      return res.status(403).json({ 
        message: 'Forbidden: Branch Admin can only create students for their own branch' 
      });
    }
    
    // Generate enrollment number if not provided
    let finalEnrollmentNumber = enrollmentNumber;
    if (!finalEnrollmentNumber) {
      const year = new Date().getFullYear();
      const courseCode = await Course.findById(course).select('code');
      const count = await MasterStudent.countDocuments({ course, branch });
      finalEnrollmentNumber = `${year}${courseCode?.code || 'CRS'}${String(count + 1).padStart(4, '0')}`;
    }
    
    const student = new MasterStudent({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      enrollmentNumber: finalEnrollmentNumber,
      course,
      branch,
      semester,
      address,
      parentName,
      parentPhone,
      parentEmail,
      createdBy: req.user._id,
      branchId: branch
    });
    
    await student.save();
    
    const populatedStudent = await MasterStudent.findById(student._id)
      .populate('course', 'name code')
      .populate('branch', 'name city');
    
    res.status(201).json(populatedStudent);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update student
router.put('/:id', checkModulePermission('students', 'edit'), async (req, res) => {
  try {
    const student = await MasterStudent.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && student.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot edit student from other branch' });
    }
    
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      course,
      semester,
      address,
      parentName,
      parentPhone,
      parentEmail,
      status
    } = req.body;
    
    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== student.email) {
      const existingStudent = await MasterStudent.findOne({ email: req.body.email });
      if (existingStudent) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }
    
    // Update student
    Object.assign(student, {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      course,
      semester,
      address,
      parentName,
      parentPhone,
      parentEmail,
      status
    });
    
    if (req.body.email) student.email = req.body.email;
    
    await student.save();
    
    const populatedStudent = await MasterStudent.findById(student._id)
      .populate('course', 'name code')
      .populate('branch', 'name city');
    
    res.json(populatedStudent);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete student
router.delete('/:id', checkModulePermission('students', 'delete'), async (req, res) => {
  try {
    const student = await MasterStudent.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check branch access for Branch Admin
    if (req.user.role === 'Branch Admin' && student.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({ message: 'Forbidden: Cannot delete student from other branch' });
    }
    
    await MasterStudent.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get students by course
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;
    
    let filter = { course: courseId };
    
    // Branch Admin can only see their own branch students
    if (user.role === 'Branch Admin') {
      filter.branchId = user.branchId;
    }
    
    const students = await MasterStudent.find(filter)
      .populate('branch', 'name city')
      .sort({ firstName: 1, lastName: 1 });
    
    res.json(students);
  } catch (error) {
    console.error('Get students by course error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get students by branch
router.get('/branch/:branchId', checkBranchAccess, async (req, res) => {
  try {
    const { branchId } = req.params;
    
    const students = await MasterStudent.find({ branchId })
      .populate('course', 'name code')
      .sort({ firstName: 1, lastName: 1 });
    
    res.json(students);
  } catch (error) {
    console.error('Get students by branch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
