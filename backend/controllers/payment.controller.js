const Razorpay = require("razorpay");
const crypto = require("crypto");

const Payment = require("../models/Payment");
const Admission = require("../models/Admission");
const Installment = require("../models/Installment");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =====================================================
   CREATE RAZORPAY ORDER (ONE TIME / EMI)
===================================================== */
exports.createOrder = async (req, res) => {
  try {
    const { amount, paymentType, admissionId, installmentNo } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `RCPT_${Date.now()}`,
      notes: {
        paymentType,
        admissionId,
        installmentNo: installmentNo || null,
      },
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
    });
  }
};

/* =====================================================
   VERIFY PAYMENT
===================================================== */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      admissionId,
      paymentType,
      installmentNo,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay signature",
      });
    }

    const admission = await Admission.findById(admissionId);
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "Admission not found",
      });
    }

    const amountPaid = admission.paymentDetails.pendingAmount <= 0
      ? 0
      : admission.paymentDetails.pendingAmount;

    // Save payment record
    const payment = new Payment({
      admissionId,
      student: admission.studentId,
      amount: amountPaid,
      paymentMethod: "Razorpay",
      paymentType,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "Completed",
      installmentNumber: installmentNo || null,
      collectedBy: req.user?._id || null,
      branch: admission.branchId,
      isVerified: true,
      verifiedAt: new Date(),
    });

    await payment.save();

    // Update admission payment details
    admission.paymentDetails.paidAmount += amountPaid;
    admission.paymentDetails.pendingAmount =
      admission.paymentDetails.totalFees -
      admission.paymentDetails.paidAmount;

    if (admission.paymentDetails.pendingAmount <= 0) {
      admission.paymentDetails.paymentStatus = "PAID";
    } else {
      admission.paymentDetails.paymentStatus = "PARTIAL";
    }

    await admission.save();

    // EMI installment update
    if (paymentType === "EMI" && installmentNo) {
      const installment = await Installment.findOne({
        admissionId,
        installmentNo,
      });

      if (installment) {
        installment.status = "PAID";
        installment.paymentId = payment._id;
        installment.paidDate = new Date();
        await installment.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment,
      admission,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

/* =====================================================
   CREATE EMI INSTALLMENTS
===================================================== */
exports.createInstallments = async (req, res) => {
  try {
    const { admissionId, numberOfInstallments, installmentAmount } = req.body;

    await Installment.deleteMany({ admissionId });

    const installments = [];

    for (let i = 1; i <= numberOfInstallments; i++) {
      installments.push({
        admissionId,
        installmentNo: i,
        amount: installmentAmount,
        totalAmount: installmentAmount,
        status: "PENDING",
      });
    }

    await Installment.insertMany(installments);

    res.status(200).json({
      success: true,
      message: "Installments created successfully",
      installments,
    });
  } catch (error) {
    console.error("Create Installment Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create installments",
    });
  }
};

/* =====================================================
   GET ADMISSION PAYMENTS
===================================================== */
exports.getAdmissionPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      admissionId: req.params.admissionId,
    })
      .populate("student", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};

/* =====================================================
   GET INSTALLMENTS
===================================================== */
exports.getAdmissionInstallments = async (req, res) => {
  try {
    const installments = await Installment.find({
      admissionId: req.params.admissionId,
    }).sort({ installmentNo: 1 });

    res.status(200).json({
      success: true,
      installments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch installments",
    });
  }
};

/* =====================================================
   PAY INSTALLMENT
===================================================== */
exports.payInstallment = async (req, res) => {
  try {
    const { installmentId } = req.params;
    
    const installment = await Installment.findById(installmentId).populate('admissionId');
    if (!installment) {
      return res.status(404).json({
        success: false,
        message: "Installment not found",
      });
    }

    if (installment.status === 'PAID') {
      return res.status(400).json({
        success: false,
        message: "Installment already paid",
      });
    }

    // Create Razorpay order for this installment
    const options = {
      amount: installment.amount * 100,
      currency: "INR",
      receipt: `INST_${installmentId}_${Date.now()}`,
      notes: {
        paymentType: 'EMI',
        admissionId: installment.admissionId._id.toString(),
        installmentNo: installment.installmentNo,
        installmentId: installmentId
      },
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      installment: {
        id: installment._id,
        amount: installment.amount,
        installmentNo: installment.installmentNo,
        dueDate: installment.dueDate
      }
    });
  } catch (error) {
    console.error("Pay Installment Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create installment payment order",
    });
  }
};

/* =====================================================
   GET PAYMENT STATS
===================================================== */
exports.getPaymentStats = async (req, res) => {
  try {
    const Payment = require("../models/Payment");
    
    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const todayPayments = await Payment.countDocuments({
      paymentDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const todayRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'Completed',
          paymentDate: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const paymentStats = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayPayments,
        todayRevenue: todayRevenue[0]?.total || 0,
        paymentMethods: paymentStats
      }
    });
  } catch (error) {
    console.error("Get Payment Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment statistics",
    });
  }
};
