const express = require('express');
const router = express.Router();
const { 
  hasMasterAccess, 
  checkModulePermission, 
  checkBranchAccess,
  checkUserCreationAccess,
  checkUserRightsAccess 
} = require('../middleware/masterAuth');

// Import all master module routes
const studentRoutes = require('./master/students');
const employeeRoutes = require('./master/employees');
const subjectRoutes = require('./master/subjects');
const materialRoutes = require('./master/materials');
const freeLearningRoutes = require('./master/freeLearning');
const examRequestRoutes = require('./master/examRequests');
const examRoutes = require('./master/exams');
const resultRoutes = require('./master/results');
const topperRoutes = require('./master/toppers');
const newsRoutes = require('./master/news');
const complaintRoutes = require('./master/complaints');
const feedbackRoutes = require('./master/feedback');
const userRightsRoutes = require('./master/userRights');
const skypeUserRoutes = require('./master/skypeUsers');

// Apply master access middleware to all master routes
router.use('/', hasMasterAccess);

// Mount all master module routes
router.use('/students', studentRoutes);
router.use('/employees', employeeRoutes);
router.use('/subjects', subjectRoutes);
router.use('/materials', materialRoutes);
router.use('/free-learning', freeLearningRoutes);
router.use('/exam-requests', examRequestRoutes);
router.use('/exams', examRoutes);
router.use('/results', resultRoutes);
router.use('/toppers', topperRoutes);
router.use('/news', newsRoutes);
router.use('/complaints', complaintRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/user-rights', userRightsRoutes);
router.use('/skype-users', skypeUserRoutes);

// Master dashboard overview
router.get('/overview', async (req, res) => {
  try {
    const MasterStudent = require('../models/MasterStudent');
    const MasterEmployee = require('../models/MasterEmployee');
    const MasterSubject = require('../models/MasterSubject');
    const MasterExam = require('../models/MasterExam');
    const MasterResult = require('../models/MasterResult');
    const MasterNews = require('../models/MasterNews');
    const MasterComplaint = require('../models/MasterComplaint');

    const user = req.user;
    let branchFilter = {};
    
    // Branch Admin can only see their own branch data
    if (user.role === 'Branch Admin') {
      branchFilter = { branchId: user.branchId };
    }

    const [
      totalStudents,
      totalEmployees,
      totalSubjects,
      totalExams,
      totalResults,
      totalNews,
      totalComplaints
    ] = await Promise.all([
      MasterStudent.countDocuments(branchFilter),
      MasterEmployee.countDocuments(branchFilter),
      MasterSubject.countDocuments(branchFilter),
      MasterExam.countDocuments(branchFilter),
      MasterResult.countDocuments(branchFilter),
      MasterNews.countDocuments(branchFilter),
      MasterComplaint.countDocuments(branchFilter)
    ]);

    res.json({
      totalStudents,
      totalEmployees,
      totalSubjects,
      totalExams,
      totalResults,
      totalNews,
      totalComplaints,
      userRole: user.role,
      branchId: user.branchId
    });
  } catch (error) {
    console.error('Master overview error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
