const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all courses (public route)
router.get('/', async (req, res) => {
  try {
    let query = { isActive: true };
    
    // Category filter
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }
    
    // Search functionality
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { shortDescription: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Status filter (for featured courses)
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Level filter
    if (req.query.level) {
      query.level = req.query.level;
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const courses = await Course.find(query)
      .populate('branches', 'name code address')
      .populate('instructor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Course.countDocuments(query);
    
    res.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID (public route)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('branches', 'name code address')
      .populate('instructor', 'firstName lastName email');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new course (Admin and Branch Admin)
router.post('/', [
  auth,
  authorize('Admin', 'Branch Admin'),
  body('title').notEmpty().withMessage('Course title is required'),
  body('code').notEmpty().withMessage('Course code is required'),
  body('category').isIn(['Accounting', 'Designing', '10+2/ College Students', 'IT For Beginners', 'Diploma', 'Global IT Certifications']).withMessage('Invalid category'),
  body('description').notEmpty().withMessage('Description is required'),
  body('shortDescription').notEmpty().withMessage('Short description is required'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('fees').isNumeric().withMessage('Fees must be a number'),
  body('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid level'),
  body('status').optional().isIn(['Active', 'Featured', 'Upcoming']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // If Branch Admin, set their branch
    if (req.user.role === 'Branch Admin') {
      req.body.branches = [req.user.branch._id];
    }

    const course = new Course(req.body);
    await course.save();
    
    await course.populate('branches', 'name code');
    
    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course (Admin and Branch Admin)
router.put('/:id', [
  auth,
  authorize('Admin', 'Branch Admin'),
  body('title').optional().notEmpty().withMessage('Course title cannot be empty'),
  body('code').optional().notEmpty().withMessage('Course code cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('branches', 'name code').populate('instructor', 'firstName lastName');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete course (Admin only)
router.delete('/:id', [auth, authorize('Admin')], async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
