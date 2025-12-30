import axios from 'axios';

/**
 * Razorpay Payment Utility
 * Handles payment order creation, verification, and checkout flow
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Create a Razorpay order
 * @param {number} amount - Payment amount in INR
 * @param {string} paymentType - 'ONE_TIME' or 'EMI'
 * @param {string} admissionId - Admission ID
 * @param {number} installmentNo - Installment number (for EMI)
 * @returns {Promise<Object>} Razorpay order details
 */
export const createPaymentOrder = async (amount, paymentType, admissionId, installmentNo = null) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required for payment');
    }

    const requestData = {
      amount,
      paymentType,
      admissionId
    };

    if (installmentNo) {
      requestData.installmentNo = installmentNo;
    }

    const response = await axios.post(`${API_BASE_URL}/payments/create-order`, requestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to create payment order');
    }
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw error;
  }
};

/**
 * Verify Razorpay payment
 * @param {Object} paymentResponse - Razorpay payment response
 * @param {string} admissionId - Admission ID
 * @param {string} paymentType - Payment type
 * @param {number} installmentNo - Installment number
 * @returns {Promise<Object>} Verification result
 */
export const verifyPayment = async (paymentResponse, admissionId, paymentType, installmentNo = null) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required for payment verification');
    }

    const requestData = {
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
      admissionId,
      amount: paymentResponse.amount / 100, // Convert from paise to INR
      paymentType
    };

    if (installmentNo) {
      requestData.installmentNo = installmentNo;
    }

    const response = await axios.post(`${API_BASE_URL}/payments/verify`, requestData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Payment verification failed');
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Initialize Razorpay checkout
 * @param {Object} options - Payment options
 * @param {number} options.amount - Amount in INR
 * @param {string} options.paymentType - 'ONE_TIME' or 'EMI'
 * @param {string} options.admissionId - Admission ID
 * @param {number} options.installmentNo - Installment number
 * @param {Object} options.userInfo - User information for prefill
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onFailure - Failure callback
 * @param {Function} options.onDismiss - Dismiss callback
 */
export const initializeRazorpayCheckout = async (options) => {
  const {
    amount,
    paymentType,
    admissionId,
    installmentNo = 1,
    userInfo = {},
    onSuccess,
    onFailure,
    onDismiss
  } = options;

  try {
    // Create order first
    const orderData = await createPaymentOrder(amount, paymentType, admissionId, installmentNo);

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      await loadRazorpayScript();
    }

    const razorpayOptions = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Smart Institute',
      description: `${paymentType} Payment - Installment ${installmentNo}`,
      image: 'https://picsum.photos/seed/smart-institute/200/200.jpg',
      order_id: orderData.orderId,
      handler: async (response) => {
        try {
          const verificationResult = await verifyPayment(response, admissionId, paymentType, installmentNo);
          onSuccess?.(verificationResult, response);
        } catch (error) {
          onFailure?.(error);
        }
      },
      prefill: {
        name: userInfo.name || '',
        email: userInfo.email || '',
        contact: userInfo.contact || ''
      },
      theme: {
        color: '#3B82F6'
      },
      modal: {
        ondismiss: () => {
          onDismiss?.();
        },
        escape: true,
        handleback: true,
        confirm_close: true,
        animation: 'fade'
      }
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();

    return razorpay;
  } catch (error) {
    onFailure?.(error);
    throw error;
  }
};

/**
 * Load Razorpay script dynamically
 * @returns {Promise<void>}
 */
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.head.appendChild(script);
  });
};

/**
 * Get payment history for an admission
 * @param {string} admissionId - Admission ID
 * @returns {Promise<Array>} Payment history
 */
export const getPaymentHistory = async (admissionId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_BASE_URL}/payments/history?admissionId=${admissionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch payment history');
    }
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

/**
 * Get installment details for an admission
 * @param {string} admissionId - Admission ID
 * @returns {Promise<Object>} Installment details
 */
export const getInstallmentDetails = async (admissionId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_BASE_URL}/payments/installments/${admissionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch installment details');
    }
  } catch (error) {
    console.error('Error fetching installment details:', error);
    throw error;
  }
};

/**
 * Calculate EMI schedule
 * @param {number} totalAmount - Total amount
 * @param {number} numberOfInstallments - Number of installments
 * @param {Date} startDate - Start date
 * @returns {Array} EMI schedule
 */
export const calculateEmiSchedule = (totalAmount, numberOfInstallments, startDate = new Date()) => {
  const installmentAmount = Math.ceil(totalAmount / numberOfInstallments);
  const schedule = [];

  for (let i = 1; i <= numberOfInstallments; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    // For the last installment, adjust the amount to match total
    const amount = i === numberOfInstallments 
      ? totalAmount - (installmentAmount * (numberOfInstallments - 1))
      : installmentAmount;

    schedule.push({
      installmentNumber: i,
      amount,
      dueDate,
      status: 'PENDING',
      paidDate: null
    });
  }

  return schedule;
};

export default {
  createPaymentOrder,
  verifyPayment,
  initializeRazorpayCheckout,
  getPaymentHistory,
  getInstallmentDetails,
  calculateEmiSchedule
};
