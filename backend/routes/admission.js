const express = require('express');
const router = express.Router();
const {
  createAdmission,
  getAdmissions,
  getAdmissionById,
  getAdmissionsByStudentId,
  updateAdmission,
  deleteAdmission,
  getAdmissionStats,
  upload
} = require('../controllers/admission.controller');
const { auth, authorize } = require('../middleware/auth');

// Public routes (for students to view their own admissions)
router.get('/student/:studentId', auth, getAdmissionsByStudentId);

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

// Protected routes
router.post('/', 
  auth, 
  authorize(['Admin', 'Branch Admin', 'Reception', 'Teacher', 'Marketing Staff', 'Student']), 
  upload.single('photo'), 
  createAdmission
);

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
