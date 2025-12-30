const crypto = require('crypto');
const { razorpayInstance } = require('../config/razorpay');
const Payment = require('../models/Payment');
const Admission = require('../models/Admission');
const User = require('../models/User');

// Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { amount, paymentType, admissionId, installmentNo } = req.body;

    // Validate input
    if (!amount || !paymentType || !admissionId) {
      return res.status(400).json({
        success: false,
        message: 'Amount, payment type, and admission ID are required'
      });
    }

    if (!['ONE_TIME', 'EMI'].includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment type. Must be ONE_TIME or EMI'
      });
    }

    // Verify admission exists and belongs to the student
    const admission = await Admission.findById(admissionId).populate('studentId');
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    // Check if user is authorized (student can only pay for their own admission)
    if (req.user.role === 'Student' && admission.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only pay for your own admission'
      });
    }

    // For EMI payments, validate installment number
    if (paymentType === 'EMI') {
      if (!installmentNo || installmentNo < 1) {
        return res.status(400).json({
          success: false,
          message: 'Valid installment number is required for EMI payments'
        });
      }

      if (installmentNo > (admission.paymentDetails.numberOfInstallments || 1)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid installment number'
        });
      }
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${admissionId}_${Date.now()}`,
      notes: {
        admissionId: admissionId.toString(),
        paymentType,
        studentId: admission.studentId._id.toString(),
        ...(installmentNo && { installmentNo: installmentNo.toString() })
      }
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        notes: order.notes,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Verify Razorpay Payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      admissionId,
      amount,
      paymentType,
      installmentNo
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !admissionId || !amount || !paymentType) {
      return res.status(400).json({
        success: false,
        message: 'All payment details are required for verification'
      });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get admission details
    const admission = await Admission.findById(admissionId).populate('studentId').populate('courseDetails.branchId');
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    // Create payment record
    const payment = new Payment({
      admissionId: admissionId,
      student: admission.studentId._id,
      amount: amount,
      paymentMethod: 'Razorpay',
      paymentType: paymentType,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'Completed',
      description: `${paymentType} payment for admission ${admission.receiptNumber}`,
      collectedBy: req.user.id,
      branch: admission.courseDetails.branchId._id,
      isVerified: true,
      verifiedAt: new Date(),
      ...(installmentNo && { installmentNumber: installmentNo })
    });

    await payment.save();

    // Update admission payment details
    const currentPaidAmount = admission.paymentDetails.paidAmount || 0;
    const newPaidAmount = currentPaidAmount + amount;
    const newPendingAmount = admission.paymentDetails.totalFees - newPaidAmount;

    admission.paymentDetails.paidAmount = newPaidAmount;
    admission.paymentDetails.pendingAmount = newPendingAmount;
    admission.paymentDetails.transactionId = razorpay_payment_id;
    admission.paymentDetails.razorpayOrderId = razorpay_order_id;

    // Update payment status
    if (newPendingAmount <= 0) {
      admission.paymentDetails.paymentStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      admission.paymentDetails.paymentStatus = 'PARTIAL';
    }

    await admission.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified and recorded successfully',
      data: {
        paymentId: payment._id,
        receiptNumber: payment.receiptNumber,
        admissionReceiptNumber: admission.receiptNumber,
        paymentStatus: admission.paymentDetails.paymentStatus,
        paidAmount: newPaidAmount,
        pendingAmount: newPendingAmount
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const { admissionId } = req.query;
    let payments;

    if (req.user.role === 'Student') {
      // Students can only see their own payments
      const admission = await Admission.findOne({ 
        studentId: req.user.id,
        ...(admissionId && { _id: admissionId })
      });
      
      if (!admission) {
        return res.status(404).json({
          success: false,
          message: 'Admission not found'
        });
      }

      payments = await Payment.find({ 
        admissionId: admission._id,
        student: req.user.id
      }).populate('admissionId', 'receiptNumber').sort({ paymentDate: -1 });

    } else {
      // Admin and Branch Admin can see all payments
      payments = await Payment.find({
        ...(admissionId && { admissionId })
      }).populate('admissionId', 'receiptNumber')
        .populate('student', 'name email')
        .sort({ paymentDate: -1 });
    }

    res.status(200).json({
      success: true,
      data: payments
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

// Get Installment Details
exports.getInstallmentDetails = async (req, res) => {
  try {
    const { admissionId } = req.params;

    const admission = await Admission.findById(admissionId);
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }

    // Check authorization
    if (req.user.role === 'Student' && admission.studentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only view your own installment details'
      });
    }

    // Generate installment details
    const installments = [];
    const numberOfInstallments = admission.paymentDetails.numberOfInstallments || 1;
    const installmentAmount = admission.paymentDetails.installmentAmount || 
      (admission.paymentDetails.totalFees / numberOfInstallments);

    for (let i = 1; i <= numberOfInstallments; i++) {
      const dueDate = new Date(admission.createdAt);
      dueDate.setMonth(dueDate.getMonth() + i);

      // Check if this installment is paid
      const existingPayment = await Payment.findOne({
        admissionId: admissionId,
        installmentNumber: i,
        status: 'Completed'
      });

      installments.push({
        installmentNumber: i,
        amount: installmentAmount,
        dueDate: dueDate,
        status: existingPayment ? 'PAID' : 'PENDING',
        paidDate: existingPayment ? existingPayment.paymentDate : null,
        receiptNumber: existingPayment ? existingPayment.receiptNumber : null
      });
    }

    res.status(200).json({
      success: true,
      data: {
        admissionId,
        totalFees: admission.paymentDetails.totalFees,
        paidAmount: admission.paymentDetails.paidAmount,
        pendingAmount: admission.paymentDetails.pendingAmount,
        paymentStatus: admission.paymentDetails.paymentStatus,
        installments
      }
    });

  } catch (error) {
    console.error('Error fetching installment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch installment details',
      error: error.message
    });
  }
};
