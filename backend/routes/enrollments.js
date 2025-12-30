const express = require('express');
const { body, validationResult } = require('express-validator');
const Enrollment = require('../models/Enrollment');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all enrollments
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Filter by role
    if (req.user.role === 'Student') {
      query.student = req.user._id;
    } else if (req.user.role === 'Branch Admin') {
      query.branch = req.user.branch._id;
    } else if (req.user.role === 'Teacher') {
      // Teachers can see enrollments for their courses
      query.instructor = req.user._id;
    }
    
    const enrollments = await Enrollment.find(query)
      .populate('student', 'firstName lastName email phone')
      .populate('course', 'title code fees')
      .populate('branch', 'name code')
      .sort({ enrollmentDate: -1 });
    
    res.json(enrollments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple dashboard endpoint without complex queries
router.get('/simple', auth, async (req, res) => {
  try {
    console.log('Simple dashboard - User:', req.user?._id, 'Role:', req.user?.role);
    
    // Check if user exists and has proper structure
    if (!req.user) {
      return res.status(401).json({ message: 'User not found in request' });
    }
    
    // Return empty data for now to avoid errors
    const result = {
      total: 0,
      enrolledNotAdmitted: 0,
      admitted: 0,
      enrollments: {
        enrolledNotAdmitted: [],
        admitted: []
      }
    };
    
    res.json(result);
  } catch (error) {
    console.error('Simple dashboard error:', error);
    res.status(500).json({ 
      message: 'Simple dashboard error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Alternative dashboard endpoint
router.get('/dashboard-alt', auth, async (req, res) => {
  try {
    console.log('Alt dashboard - User:', req.user._id, 'Role:', req.user.role);
    
    // Start with empty result
    const result = {
      total: 0,
      enrolledNotAdmitted: 0,
      admitted: 0,
      enrollments: {
        enrolledNotAdmitted: [],
        admitted: []
      }
    };
    
    // For students, get their enrollments
    if (req.user.role === 'Student') {
      try {
        const studentEnrollments = await Enrollment.find({ student: req.user._id })
          .populate('student', 'firstName lastName email phone')
          .populate('course', 'title code fees')
          .populate('branch', 'name code')
          .sort({ createdAt: -1 })
          .limit(10); // Limit to avoid performance issues
        
        result.total = studentEnrollments.length;
        result.enrollments.enrolledNotAdmitted = studentEnrollments.filter(e => 
          e.enrollmentStatus === 'ENROLLED_NOT_ADMITTED'
        );
        result.enrollments.admitted = studentEnrollments.filter(e => 
          e.enrollmentStatus === 'ADMITTED'
        );
        result.enrolledNotAdmitted = result.enrollments.enrolledNotAdmitted.length;
        result.admitted = result.enrollments.admitted.length;
        
      } catch (enrollError) {
        console.error('Error fetching student enrollments:', enrollError);
        // Return empty result on error
      }
    }
    
    res.json(result);
  } catch (error) {
    console.error('Alt dashboard error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message
    });
  }
});

// Get enrollment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student', 'firstName lastName email phone address')
      .populate('course', 'title code description fees duration syllabus')
      .populate('branch', 'name code address contact')
      .populate('enrolledBy', 'firstName lastName');
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    res.json(enrollment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new enrollment
router.post('/', [
  auth,
  authorize('Admin', 'Branch Admin', 'Reception'),
  body('student').notEmpty().withMessage('Student is required'),
  body('course').notEmpty().withMessage('Course is required'),
  body('branch').notEmpty().withMessage('Branch is required'),
  body('totalFees').isNumeric().withMessage('Total fees must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const enrollment = new Enrollment({
      ...req.body,
      balanceFees: req.body.totalFees - (req.body.feesPaid || 0),
      enrolledBy: req.user._id
    });
    
    await enrollment.save();
    
    await enrollment.populate([
      { path: 'student', select: 'firstName lastName email phone' },
      { path: 'course', select: 'title code fees' },
      { path: 'branch', select: 'name code' }
    ]);
    
    res.status(201).json({
      message: 'Enrollment created successfully',
      enrollment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student self-enrollment
router.post('/self-enroll', [
  auth,
  authorize('Student'),
  body('course').notEmpty().withMessage('Course is required'),
  body('branch').notEmpty().withMessage('Branch is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { course, branch } = req.body;
    const student = req.user._id;

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student,
      course,
      enrollmentStatus: { $in: ['ENROLLED_NOT_ADMITTED', 'ADMITTED'] }
    });

    if (existingEnrollment) {
      return res.status(400).json({ 
        message: 'You are already enrolled in this course',
        enrollmentStatus: existingEnrollment.enrollmentStatus,
        admissionId: existingEnrollment.admissionId
      });
    }

    // Get course details
    const Course = require('../models/Course');
    const courseDetails = await Course.findById(course);
    
    if (!courseDetails) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Create enrollment with ENROLLED_NOT_ADMITTED status
    const enrollment = new Enrollment({
      student,
      course,
      branch,
      totalFees: courseDetails.fees,
      balanceFees: courseDetails.fees,
      enrollmentStatus: 'ENROLLED_NOT_ADMITTED',
      enrolledBy: student
    });
    
    await enrollment.save();
    
    await enrollment.populate([
      { path: 'student', select: 'firstName lastName email phone' },
      { path: 'course', select: 'title code fees duration' },
      { path: 'branch', select: 'name code address' }
    ]);
    
    res.status(201).json({
      message: 'Enrollment successful! Redirecting to admission form...',
      enrollment,
      requiresAdmission: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update enrollment
router.put('/:id', [
  auth,
  authorize('Admin', 'Branch Admin'),
  body('status').optional().isIn(['Active', 'Completed', 'Dropped', 'On Hold']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('student', 'firstName lastName email')
     .populate('course', 'title code')
     .populate('branch', 'name code');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({
      message: 'Enrollment updated successfully',
      enrollment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test endpoint
router.get('/test', auth, async (req, res) => {
  try {
    console.log('Test endpoint - User:', req.user._id, 'Role:', req.user.role);
    res.json({ message: 'Test successful', user: req.user._id, role: req.user.role });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ message: 'Test error', error: error.message });
  }
});

// Simple test endpoint without population
router.get('/simple-test', auth, async (req, res) => {
  try {
    console.log('Simple test endpoint - User:', req.user._id, 'Role:', req.user.role);
    
    const Enrollment = require('../models/Enrollment');
    
    // Test if model is properly loaded
    console.log('Enrollment model exists:', !!Enrollment);
    
    // Test database connection with a very simple query
    try {
      const count = await Enrollment.countDocuments();
      console.log('Total enrollments in database:', count);
      
      // Get a few enrollments without any population
      const enrollments = await Enrollment.find({})
        .limit(5)
        .lean();
      
      console.log('Found enrollments:', enrollments.length);
      
      res.json({
        success: true,
        count: enrollments.length,
        totalCount: count,
        enrollments: enrollments,
        user: {
          id: req.user._id,
          role: req.user.role
        },
        message: 'Simple test completed successfully'
      });
      
    } catch (dbError) {
      console.error('Database query error:', dbError);
      res.status(500).json({ 
        success: false,
        message: 'Database query failed', 
        error: dbError.message,
        stack: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
      });
    }
    
  } catch (error) {
    console.error('Simple test endpoint error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Simple test endpoint error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Debug endpoint to test enrollment functionality
router.get('/debug', auth, async (req, res) => {
  try {
    console.log('Debug endpoint - User:', req.user._id, 'Role:', req.user.role);
    
    // Test basic database connection
    const Enrollment = require('../models/Enrollment');
    console.log('Enrollment model loaded:', !!Enrollment);
    
    // Test simple count query
    const count = await Enrollment.countDocuments().catch(err => {
      console.error('Count query error:', err);
      return 0;
    });
    
    console.log('Total enrollments count:', count);
    
    // Test simple find query
    const enrollments = await Enrollment.find({})
      .limit(1)
      .catch(err => {
        console.error('Find query error:', err);
        return [];
      });
    
    console.log('Sample enrollment found:', enrollments.length > 0 ? 'Yes' : 'No');
    
    res.json({
      success: true,
      user: {
        id: req.user._id,
        role: req.user.role,
        branch: req.user.branch
      },
      enrollmentCount: count,
      hasSampleEnrollment: enrollments.length > 0,
      message: 'Debug completed successfully'
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Debug endpoint error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get enrollments for admin dashboards
router.get('/dashboard', auth, async (req, res) => {
  try {
    console.log('Dashboard enrollments request - User:', req.user._id, 'Role:', req.user.role);
    
    // Always return safe default data first
    const result = {
      total: 0,
      enrolledNotAdmitted: 0,
      admitted: 0,
      enrollments: {
        enrolledNotAdmitted: [],
        admitted: []
      }
    };
    
    // Only attempt database operations if we have a valid user
    if (req.user && req.user._id) {
      try {
        const Enrollment = require('../models/Enrollment');
        
        // Build query based on user role
        let query = {};
        if (req.user.role === 'Student') {
          query.student = req.user._id;
        } else if (req.user.role === 'Branch Admin') {
          query.branch = req.user.branch?._id;
        }
        // Admin can see all enrollments, so no filter needed
        
        console.log('Executing dashboard query:', JSON.stringify(query));
        
        // Get enrollments with proper population
        const enrollments = await Enrollment.find(query)
          .populate('student', 'firstName lastName email phone')
          .populate('course', 'title code fees')
          .populate('branch', 'name code')
          .sort({ enrolledAt: -1 })
          .limit(50) // Limit to prevent performance issues
          .catch(err => {
            console.error('Enrollment query failed:', err.message);
            return [];
          });
        
        console.log('Dashboard query found:', enrollments.length, 'enrollments');
        
        // Process enrollments
        result.total = enrollments.length;
        result.enrollments.enrolledNotAdmitted = enrollments.filter(e => 
          e.enrollmentStatus === 'ENROLLED_NOT_ADMITTED'
        );
        result.enrollments.admitted = enrollments.filter(e => 
          e.enrollmentStatus === 'ADMITTED'
        );
        result.enrolledNotAdmitted = result.enrollments.enrolledNotAdmitted.length;
        result.admitted = result.enrollments.admitted.length;
        
        console.log('Dashboard result:', {
          total: result.total,
          enrolledNotAdmitted: result.enrolledNotAdmitted,
          admitted: result.admitted
        });
        
      } catch (dbError) {
        console.error('Database operation failed:', dbError.message);
        // Continue with default data
      }
    } else {
      console.warn('No valid user in request');
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Dashboard endpoint failed:', error.message);
    // Always return something, never fail
    res.status(500).json({
      total: 0,
      enrolledNotAdmitted: 0,
      admitted: 0,
      enrollments: {
        enrolledNotAdmitted: [],
        admitted: []
      },
      error: 'Dashboard temporarily unavailable',
      message: 'Please try again later'
    });
  }
});

// Update enrollment status to admitted
router.put('/:id/admit', [
  auth,
  authorize('Admin', 'Branch Admin'),
  body('admissionId').notEmpty().withMessage('Admission ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { 
        enrollmentStatus: 'ADMITTED',
        admissionId: req.body.admissionId
      },
      { new: true, runValidators: true }
    ).populate('student', 'firstName lastName email')
     .populate('course', 'title code')
     .populate('branch', 'name code');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({
      message: 'Enrollment marked as admitted successfully',
      enrollment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
