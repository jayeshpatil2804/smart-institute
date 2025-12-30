const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getAdmissionPayments,
  createInstallments,
  getAdmissionInstallments,
  payInstallment,
  getPaymentStats
} = require('../controllers/payment.controller');
const { auth, authorize } = require('../middleware/auth');

// Public routes (for payment processing)
router.post('/create-order', auth, createOrder);
router.post('/verify', auth, verifyPayment);

// Protected routes
router.get('/admission/:admissionId', 
  auth, 
  authorize(['Super Admin', 'Admin', 'Branch Admin', 'Reception', 'Teacher', 'Marketing Staff', 'Student']), 
  getAdmissionPayments
);

router.post('/installments', 
  auth, 
  authorize(['Super Admin', 'Admin', 'Branch Admin', 'Reception']), 
  createInstallments
);

router.get('/installments/:admissionId', 
  auth, 
  authorize(['Super Admin', 'Admin', 'Branch Admin', 'Reception', 'Teacher', 'Marketing Staff', 'Student']), 
  getAdmissionInstallments
);

router.post('/installments/:installmentId/pay', 
  auth, 
  authorize(['Super Admin', 'Admin', 'Branch Admin', 'Reception', 'Student']), 
  payInstallment
);

router.get('/stats', 
  auth, 
  authorize(['Super Admin', 'Admin', 'Branch Admin', 'Reception']), 
  getPaymentStats
);

// Legacy routes for backward compatibility
router.get('/', auth, async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    let query = {};
    
    // Filter by role
    if (req.user.role === 'Student') {
      query.student = req.user._id;
    } else if (req.user.role === 'Branch Admin') {
      query.branch = req.user.branch._id;
    }
    
    const payments = await Payment.find(query)
      .populate('student', 'firstName lastName email')
      .populate('admissionId', 'receiptNumber')
      .populate('branch', 'name code')
      .populate('collectedBy', 'firstName lastName')
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const payment = await Payment.findById(req.params.id)
      .populate('student', 'firstName lastName email mobile')
      .populate('admissionId', 'receiptNumber')
      .populate('branch', 'name code address')
      .populate('collectedBy', 'firstName lastName');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
