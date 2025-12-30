import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [admissionDetails, setAdmissionDetails] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [selectedInstallment, setSelectedInstallment] = useState(null);

  // Get admission details from location state or fetch by ID
  const { admissionId, amount, paymentType } = location.state || {};

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    // Fetch admission details if not provided
    if (admissionId) {
      fetchAdmissionDetails();
    }

    return () => {
      document.body.removeChild(script);
    };
  }, [admissionId]);

  const fetchAdmissionDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admissions/${admissionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdmissionDetails(data);
        
        // Fetch installments if it's EMI payment
        if (data.paymentDetails.paymentType === 'EMI') {
          fetchInstallments();
        }
      }
    } catch (error) {
      console.error('Error fetching admission details:', error);
      alert('Failed to fetch admission details');
    }
  };

  const fetchInstallments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/payments/installments/${admissionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInstallments(data.data.installments || []);
      }
    } catch (error) {
      console.error('Error fetching installments:', error);
    }
  };

  const handlePayment = async (paymentAmount, installmentNo = null) => {
    if (!razorpayLoaded) {
      alert('Payment gateway is loading. Please wait...');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      // Create Razorpay order
      const orderResponse = await fetch('http://localhost:5000/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: paymentAmount,
          paymentType: installmentNo ? 'EMI' : 'ONE_TIME',
          admissionId: admissionId,
          installmentNo: installmentNo
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      // Open Razorpay checkout
      const options = {
        key: orderData.data.keyId,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'Smart Institute',
        description: `${installmentNo ? `EMI Installment ${installmentNo}` : 'Course Admission'} Payment`,
        order_id: orderData.data.orderId,
        prefill: {
          name: user?.name || user?.firstName + ' ' + user?.lastName || '',
          email: user?.email || '',
          contact: user?.mobile || user?.mobileNumber || ''
        },
        theme: {
          color: '#3B82F6'
        },
        handler: async function (response) {
          // Verify payment
          await verifyPayment(response, paymentAmount, installmentNo);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            alert('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert(error.message || 'Payment failed');
      setLoading(false);
    }
  };

  const verifyPayment = async (response, paymentAmount, installmentNo) => {
    try {
      const token = localStorage.getItem('token');

      const verifyResponse = await fetch('http://localhost:5000/api/payments/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          admissionId: admissionId,
          amount: paymentAmount,
          paymentType: installmentNo ? 'EMI' : 'ONE_TIME',
          installmentNo: installmentNo
        })
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        alert('Payment successful! 🎉');
        
        // Update local state
        if (installmentNo) {
          setInstallments(prev => 
            prev.map(inst => 
              inst.installmentNumber === installmentNo 
                ? { ...inst, status: 'PAID', paidDate: new Date() }
                : inst
            )
          );
        }

        // Redirect to dashboard after successful payment
        setTimeout(() => {
          navigate('/dashboard', { 
            state: { 
              paymentSuccess: true,
              message: 'Payment completed successfully'
            } 
          });
        }, 2000);
      } else {
        throw new Error(verifyData.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert(error.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  const renderOneTimePayment = () => {
    const pendingAmount = admissionDetails?.paymentDetails?.pendingAmount || 0;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">One-Time Payment</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Fees:</span>
            <span className="text-xl font-bold">₹{admissionDetails?.paymentDetails?.totalFees || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Paid Amount:</span>
            <span className="text-lg">₹{admissionDetails?.paymentDetails?.paidAmount || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Pending Amount:</span>
            <span className="text-lg font-semibold text-orange-600">₹{pendingAmount}</span>
          </div>
          
          {pendingAmount > 0 && (
            <button
              onClick={() => handlePayment(pendingAmount)}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : `Pay ₹${pendingAmount}`}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderEMIPayments = () => {
    const pendingInstallments = installments.filter(inst => inst.status === 'PENDING');
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">EMI Installments</h3>
        <div className="space-y-4">
          {installments.map((installment) => (
            <div key={installment.installmentNumber} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="font-semibold">Installment {installment.installmentNumber}</h4>
                  <p className="text-sm text-gray-600">
                    Due Date: {new Date(installment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">₹{installment.amount}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    installment.status === 'PAID' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {installment.status}
                  </span>
                </div>
              </div>
              
              {installment.status === 'PENDING' && (
                <button
                  onClick={() => handlePayment(installment.amount, installment.installmentNumber)}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : `Pay Installment ${installment.installmentNumber}`}
                </button>
              )}
              
              {installment.status === 'PAID' && (
                <div className="text-sm text-gray-600">
                  <p>Paid on: {new Date(installment.paidDate).toLocaleDateString()}</p>
                  <p>Receipt: {installment.receiptNumber}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!admissionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Payment Request</h2>
          <p className="text-gray-600 mb-6">No admission details found for payment.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Payment Portal</h2>
          {admissionDetails && (
            <div className="border-b pb-4 mb-4">
              <p><strong>Admission Receipt:</strong> {admissionDetails.receiptNumber}</p>
              <p><strong>Student Name:</strong> {admissionDetails.personalDetails?.fullName}</p>
              <p><strong>Course:</strong> {admissionDetails.courseDetails?.courseId?.name || 'N/A'}</p>
              <p><strong>Payment Type:</strong> {admissionDetails.paymentDetails?.paymentType}</p>
            </div>
          )}
        </div>

        {!razorpayLoaded && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">Loading payment gateway...</p>
          </div>
        )}

        {admissionDetails?.paymentDetails?.paymentType === 'ONE_TIME' && renderOneTimePayment()}
        {admissionDetails?.paymentDetails?.paymentType === 'EMI' && renderEMIPayments()}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Payment Information:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• All payments are secure and encrypted</li>
            <li>• You will receive a receipt after successful payment</li>
            <li>• For any payment issues, contact support</li>
            <li>• EMI installments can be paid individually as per due dates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Payment;
