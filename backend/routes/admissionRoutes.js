const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createAdmission,
  getAdmissions,
  getAdmissionById,
  getAdmissionsByStudentId,
  updateAdmission,
  deleteAdmission,
  getAdmissionStats
} = require('../controllers/admission.controller');
const { auth, authorize } = require('../middleware/auth');

// Configure multer for photo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/admissions');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'student-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, JPG, PNG, GIF)'));
    }
  }
});

// Student admission route - for online admission with payment verification
router.post('/student', 
  auth, 
  authorize(['Student']), 
  upload.single('photo'), 
  createAdmission
);

// Admin/Staff admission route - for manual admission creation
router.post('/admin', 
  auth, 
  authorize(['Admin', 'Branch Admin', 'Reception', 'Teacher', 'Marketing Staff']), 
  upload.single('photo'), 
  createAdmission
);

// Simple admission route without file upload for testing
router.post('/simple', 
  auth, 
  authorize(['Admin', 'Branch Admin', 'Reception', 'Teacher', 'Marketing Staff', 'Student']), 
  async (req, res) => {
    try {
      console.log('Simple admission route - User:', req.user._id, 'Role:', req.user.role);
      
      const Admission = require('../models/Admission');
      const Course = require('../models/Course');
      const User = require('../models/User');
      const Branch = require('../models/Branch');

      const {
        studentId,
        personalDetails,
        address,
        courseDetails,
        paymentDetails
      } = req.body;

      // Parse JSON fields
      const parsedPersonalDetails = typeof personalDetails === 'string' ? JSON.parse(personalDetails) : personalDetails;
      const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
      const parsedCourseDetails = typeof courseDetails === 'string' ? JSON.parse(courseDetails) : courseDetails;
      const parsedPaymentDetails = typeof paymentDetails === 'string' ? JSON.parse(paymentDetails) : paymentDetails;

      // Validate student exists
      const student = await User.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Validate course exists and get details
      const course = await Course.findById(parsedCourseDetails.courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Validate branch exists
      const branch = await Branch.findById(parsedCourseDetails.branchId);
      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }

      // Create admission
      const admission = new Admission({
        studentId,
        personalDetails: parsedPersonalDetails,
        address: parsedAddress,
        courseDetails: {
          ...parsedCourseDetails,
          courseDuration: course.duration || '6 months',
          courseFees: course.fees || 0
        },
        paymentDetails: {
          ...parsedPaymentDetails,
          totalFees: course.fees || 0,
          paidAmount: 0,
          pendingAmount: course.fees || 0,
          paymentStatus: 'PENDING'
        },
        createdBy: req.user._id
      });

      await admission.save();

      res.status(201).json({
        message: 'Admission created successfully',
        admission
      });
    } catch (error) {
      console.error('Error creating simple admission:', error);
      res.status(500).json({ 
        message: 'Error creating admission',
        error: error.message 
      });
    }
  }
);

// Public routes (for students to view their own admissions)
router.get('/student/:studentId', auth, getAdmissionsByStudentId);

// Protected routes
router.get('/', 
  auth, 
  authorize(['Admin', 'Branch Admin', 'Reception', 'Teacher', 'Marketing Staff', 'Student']), 
  getAdmissions
);

router.get('/stats', 
  auth, 
  authorize(['Admin', 'Branch Admin', 'Reception', 'Teacher', 'Marketing Staff', 'Student']), 
  getAdmissionStats
);

router.get('/:id', 
  auth, 
  authorize(['Admin', 'Branch Admin', 'Reception', 'Teacher', 'Marketing Staff', 'Student']), 
  getAdmissionById
);

router.put('/:id', 
  auth, 
  authorize(['Admin', 'Branch Admin', 'Reception']), 
  updateAdmission
);

router.delete('/:id', 
  auth, 
  authorize(['Admin', 'Branch Admin']), 
  deleteAdmission
);

module.exports = router;
