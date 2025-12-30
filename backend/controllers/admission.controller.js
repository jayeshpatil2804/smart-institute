const Admission = require('../models/Admission');
const Course = require('../models/Course');
const User = require('../models/User');
const Branch = require('../models/Branch');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Create new admission
const createAdmission = async (req, res) => {
  try {
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

    // Handle photo upload
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/admissions/${req.file.filename}`;
    }

    // Create admission with updated payment structure
    const admission = new Admission({
      studentId,
      personalDetails: {
        ...parsedPersonalDetails,
        photoUrl
      },
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

    // Populate related data for response
    await admission.populate([
      { path: 'studentId', select: 'firstName lastName email mobile' },
      { path: 'courseDetails.courseId', select: 'title code fees duration' },
      { path: 'courseDetails.branchId', select: 'name address' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);

    res.status(201).json({
      message: 'Admission created successfully',
      admission
    });
  } catch (error) {
    console.error('Error creating admission:', error);
    res.status(500).json({ 
      message: 'Error creating admission',
      error: error.message 
    });
  }
};

// Get all admissions (with role-based filtering)
const getAdmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, branchId, courseId, status } = req.query;
    const skip = (page - 1) * limit;

    // Build filter based on user role
    let filter = {};
    
    if (req.user.role === 'Branch Admin') {
      filter['courseDetails.branchId'] = req.user.branch._id;
    } else if (req.user.role === 'Student') {
      filter.studentId = req.user._id;
    } else if (branchId) {
      filter['courseDetails.branchId'] = branchId;
    }

    if (courseId) {
      filter['courseDetails.courseId'] = courseId;
    }

    if (status) {
      filter.status = status;
    }

    const admissions = await Admission.find(filter)
      .populate([
        { path: 'studentId', select: 'firstName lastName email mobile' },
        { path: 'courseDetails.courseId', select: 'title code fees duration' },
        { path: 'courseDetails.branchId', select: 'name address' },
        { path: 'createdBy', select: 'firstName lastName' }
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Admission.countDocuments(filter);

    res.json({
      admissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({ 
      message: 'Error fetching admissions',
      error: error.message 
    });
  }
};

// Get admission by ID
const getAdmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    let admission;
    
    // Role-based access control
    if (req.user.role === 'Student') {
      admission = await Admission.findOne({ _id: id, studentId: req.user._id });
    } else if (req.user.role === 'Branch Admin') {
      admission = await Admission.findOne({ 
        _id: id, 
        'courseDetails.branchId': req.user.branch._id 
      });
    } else {
      admission = await Admission.findById(id);
    }

    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    await admission.populate([
      { path: 'studentId', select: 'firstName lastName email mobile' },
      { path: 'courseDetails.courseId', select: 'title code fees duration' },
      { path: 'courseDetails.branchId', select: 'name address phone email' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);

    res.json(admission);
  } catch (error) {
    console.error('Error fetching admission:', error);
    res.status(500).json({ 
      message: 'Error fetching admission',
      error: error.message 
    });
  }
};

// Get admissions by student ID
const getAdmissionsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Students can only view their own admissions
    if (req.user.role === 'Student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const admissions = await Admission.find({ studentId })
      .populate([
        { path: 'studentId', select: 'firstName lastName email mobile' },
        { path: 'courseDetails.courseId', select: 'title code fees duration' },
        { path: 'courseDetails.branchId', select: 'name address' },
        { path: 'createdBy', select: 'firstName lastName' }
      ])
      .sort({ createdAt: -1 });

    res.json(admissions);
  } catch (error) {
    console.error('Error fetching student admissions:', error);
    res.status(500).json({ 
      message: 'Error fetching student admissions',
      error: error.message 
    });
  }
};

// Update admission
const updateAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let admission;
    
    // Role-based access control
    if (req.user.role === 'Branch Admin') {
      admission = await Admission.findOne({ 
        _id: id, 
        'courseDetails.branchId': req.user.branch._id 
      });
    } else {
      admission = await Admission.findById(id);
    }

    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key === 'personalDetails' || key === 'address' || key === 'courseDetails' || key === 'paymentDetails') {
        admission[key] = { ...admission[key], ...updates[key] };
      } else {
        admission[key] = updates[key];
      }
    });

    await admission.save();

    await admission.populate([
      { path: 'studentId', select: 'firstName lastName email mobile' },
      { path: 'courseDetails.courseId', select: 'title code fees duration' },
      { path: 'courseDetails.branchId', select: 'name address' },
      { path: 'createdBy', select: 'firstName lastName' }
    ]);

    res.json({
      message: 'Admission updated successfully',
      admission
    });
  } catch (error) {
    console.error('Error updating admission:', error);
    res.status(500).json({ 
      message: 'Error updating admission',
      error: error.message 
    });
  }
};

// Delete admission
const deleteAdmission = async (req, res) => {
  try {
    const { id } = req.params;

    let admission;
    
    // Role-based access control
    if (req.user.role === 'Branch Admin') {
      admission = await Admission.findOne({ 
        _id: id, 
        'courseDetails.branchId': req.user.branch._id 
      });
    } else {
      admission = await Admission.findById(id);
    }

    if (!admission) {
      return res.status(404).json({ message: 'Admission not found' });
    }

    // Delete photo if exists
    if (admission.personalDetails.photoUrl) {
      const photoPath = path.join(__dirname, '..', admission.personalDetails.photoUrl);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await Admission.findByIdAndDelete(id);

    res.json({ message: 'Admission deleted successfully' });
  } catch (error) {
    console.error('Error deleting admission:', error);
    res.status(500).json({ 
      message: 'Error deleting admission',
      error: error.message 
    });
  }
};

// Get admission statistics
const getAdmissionStats = async (req, res) => {
  try {
    let matchStage = {};
    
    // Role-based filtering
    if (req.user.role === 'Branch Admin') {
      matchStage['courseDetails.branchId'] = req.user.branch._id;
    }

    const stats = await Admission.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAdmissions: { $sum: 1 },
          activeAdmissions: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          completedAdmissions: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$paymentDetails.registrationFees' }
        }
      }
    ]);

    const courseStats = await Admission.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseDetails.courseId',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$course.title',
          count: { $sum: 1 },
          revenue: { $sum: '$paymentDetails.registrationFees' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      stats: stats[0] || {
        totalAdmissions: 0,
        activeAdmissions: 0,
        completedAdmissions: 0,
        totalRevenue: 0
      },
      courseStats
    });
  } catch (error) {
    console.error('Error fetching admission stats:', error);
    res.status(500).json({ 
      message: 'Error fetching admission stats',
      error: error.message 
    });
  }
};

module.exports = {
  createAdmission,
  getAdmissions,
  getAdmissionById,
  getAdmissionsByStudentId,
  updateAdmission,
  deleteAdmission,
  getAdmissionStats,
  upload
};
