import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Upload, Calendar, MapPin, Phone, Mail, User, CreditCard, ArrowLeft, Download, Share2, Calculator, Wallet } from 'lucide-react';
import { initializeRazorpayCheckout, calculateEmiSchedule } from '../utils/razorpay';

const AdmissionForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [admissionData, setAdmissionData] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [autoFillData, setAutoFillData] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    studentId: '',
    personalDetails: {
      fullName: '',
      mobileNumber: '',
      emailId: '',
      dateOfBirth: '',
      gender: '',
      photoUrl: null
    },
    address: {
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      district: '',
      pincode: '',
      state: ''
    },
    courseDetails: {
      courseId: '',
      batchId: '',
      branchId: '',
      courseDuration: '',
      courseFees: 0
    },
    paymentDetails: {
      paymentType: 'ONE_TIME',
      totalFees: 0,
      paidAmount: 0,
      pendingAmount: 0,
      paymentStatus: 'PENDING',
      registrationFees: 0,
      paymentMode: 'Razorpay',
      transactionId: '',
      numberOfInstallments: 1,
      installmentAmount: 0
    }
  });

  // EMI calculation state
  const [emiSchedule, setEmiSchedule] = useState([]);
  const [showEmiPreview, setShowEmiPreview] = useState(false);

  // Dropdown data
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchInitialData();
    
    // Check for auto-fill data from location state (from enrollment flow)
    const stateData = location.state;
    if (stateData && stateData.enrollment) {
      setAutoFillData(stateData);
      setEnrollment(stateData.enrollment);
      
      // Auto-fill form with enrollment data
      setFormData(prev => ({
        ...prev,
        studentId: user?._id || '',
        personalDetails: {
          ...prev.personalDetails,
          fullName: `${user?.firstName || ''} ${user?.lastName || ''}`,
          emailId: user?.email || '',
          mobileNumber: user?.mobile || ''
        },
        courseDetails: {
          ...prev.courseDetails,
          courseId: stateData.course._id,
          branchId: stateData.branch._id,
          courseDuration: stateData.course.duration || '6 months',
          courseFees: stateData.course.fees || 0
        },
        paymentDetails: {
          ...prev.paymentDetails,
          totalFees: stateData.course.fees || 0,
          pendingAmount: stateData.course.fees || 0,
          registrationFees: 1000
        }
      }));
      
      // Fetch batches for this course
      handleCourseChange(stateData.course._id);
    } else if (user) {
      // Normal flow - auto-fill with user data
      setFormData(prev => ({
        ...prev,
        studentId: user._id,
        personalDetails: {
          ...prev.personalDetails,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`,
          emailId: user.email || '',
          mobileNumber: user.mobile || ''
        }
      }));
    }
    
    // Check for existing enrollment if no auto-fill data
    if (!stateData && user?.role === 'Student') {
      fetchExistingEnrollment();
    }
  }, [user, location.state]);

  const fetchExistingEnrollment = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/enrollments/simple', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const notAdmitted = response.data.enrollments.enrolledNotAdmitted[0];
      if (notAdmitted) {
        setEnrollment(notAdmitted);
        
        // Auto-fill form with existing enrollment data
        setFormData(prev => ({
          ...prev,
          studentId: user._id,
          personalDetails: {
            ...prev.personalDetails,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`,
            emailId: user.email || '',
            mobileNumber: user.mobile || ''
          },
          courseDetails: {
            ...prev.courseDetails,
            courseId: notAdmitted.course._id,
            branchId: notAdmitted.branch._id,
            courseDuration: notAdmitted.course.duration || '6 months',
            courseFees: notAdmitted.course.fees || 0
          },
          paymentDetails: {
            ...prev.paymentDetails,
            totalFees: notAdmitted.course.fees || 0,
            pendingAmount: notAdmitted.course.fees || 0,
            registrationFees: 1000
          }
        }));
        
        // Fetch batches for this course
        handleCourseChange(notAdmitted.course._id);
      }
    } catch (error) {
      console.error('Error fetching existing enrollment:', error);
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Prepare authenticated requests
      const authConfig = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      const requests = [
        axios.get('http://localhost:5000/api/courses'),
        axios.get('http://localhost:5000/api/branches')
      ];
      
      // Only fetch users if user has admin privileges
      if (user && ['Super Admin', 'Admin', 'Branch Admin', 'Reception'].includes(user.role)) {
        requests.push(axios.get('http://localhost:5000/api/users', authConfig));
      }
      
      const responses = await Promise.all(requests);
      
      setCourses(responses[0].data.courses || []);
      setBranches(responses[1].data);
      
      if (responses[2]) {
        setStudents(responses[2].data.filter(u => u.role === 'Student'));
      }

      // Set default branch based on user role
      if (user?.role === 'Branch Admin' && user.branch) {
        setFormData(prev => ({
          ...prev,
          courseDetails: {
            ...prev.courseDetails,
            branchId: user.branch._id
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      // For non-authenticated users, we can still show courses and branches
      if (error.response?.status === 401) {
        console.log('Some data requires authentication - proceeding with available data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = async (courseId) => {
    const course = courses.find(c => c._id === courseId);
    if (course) {
      const courseFees = course.fees || 0;
      const registrationFees = courseFees * 0.1; // 10% of course fees as registration
      
      setFormData(prev => ({
        ...prev,
        courseDetails: {
          ...prev.courseDetails,
          courseId,
          courseDuration: course.duration || '6 months',
          courseFees,
          registrationFees
        },
        paymentDetails: {
          ...prev.paymentDetails,
          totalFees: courseFees,
          pendingAmount: courseFees,
          registrationFees,
          installmentAmount: courseFees
        }
      }));

      // Fetch batches for this course (mock data for now)
      setBatches([
        { _id: 'batch1', name: 'Morning Batch (9AM - 12PM)', courseId },
        { _id: 'batch2', name: 'Afternoon Batch (1PM - 4PM)', courseId },
        { _id: 'batch3', name: 'Evening Batch (5PM - 8PM)', courseId }
      ]);
    }
  };

  const handlePaymentTypeChange = (paymentType) => {
    setFormData(prev => {
      const updatedPaymentDetails = {
        ...prev.paymentDetails,
        paymentType
      };

      if (paymentType === 'EMI' && prev.paymentDetails.numberOfInstallments > 1) {
        const totalFees = prev.paymentDetails.totalFees || 0;
        const numberOfInstallments = prev.paymentDetails.numberOfInstallments || 1;
        const installmentAmount = totalFees > 0 ? Math.ceil(totalFees / numberOfInstallments) : 0;
        updatedPaymentDetails.installmentAmount = installmentAmount;
        
        // Generate EMI schedule for preview
        const schedule = calculateEmiSchedule(
          prev.paymentDetails.totalFees,
          prev.paymentDetails.numberOfInstallments,
          new Date()
        );
        setEmiSchedule(schedule);
        setShowEmiPreview(true);
      } else {
        setShowEmiPreview(false);
      }

      return {
        ...prev,
        paymentDetails: updatedPaymentDetails
      };
    });
  };

  const handleInstallmentsChange = (numberOfInstallments) => {
    setFormData(prev => {
      const totalFees = prev.paymentDetails.totalFees || 0;
      const installmentAmount = totalFees > 0 ? Math.ceil(totalFees / numberOfInstallments) : 0;
      const schedule = calculateEmiSchedule(
        totalFees,
        numberOfInstallments,
        new Date()
      );
      
      setEmiSchedule(schedule);
      setShowEmiPreview(true);

      return {
        ...prev,
        paymentDetails: {
          ...prev.paymentDetails,
          numberOfInstallments,
          installmentAmount
        }
      };
    });
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const initializeRazorpay = async (amount, admissionId, paymentType = 'ONE_TIME', installmentNumber = 1) => {
    try {
      setPaymentProcessing(true);
      
      await initializeRazorpayCheckout({
        amount,
        paymentType,
        admissionId,
        installmentNo: installmentNumber,
        userInfo: {
          name: formData.personalDetails.fullName,
          email: formData.personalDetails.emailId,
          contact: formData.personalDetails.mobileNumber
        },
        onSuccess: async (verificationResult, paymentResponse) => {
          // Update form data with payment info
          setFormData(prev => ({
            ...prev,
            paymentDetails: {
              ...prev.paymentDetails,
              paidAmount: verificationResult.paidAmount,
              pendingAmount: verificationResult.pendingAmount,
              paymentStatus: verificationResult.paymentStatus,
              transactionId: paymentResponse.razorpay_payment_id,
              razorpayOrderId: paymentResponse.razorpay_order_id
            }
          }));

          setPaymentProcessing(false);
          alert('Payment successful! Your admission has been confirmed.');
          
          // Fetch updated admission data
          try {
            const admissionResponse = await axios.get(`http://localhost:5000/api/admissions/${admissionId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            setAdmissionData(admissionResponse.data);
            setShowReceipt(true);
          } catch (error) {
            console.error('Error fetching admission data:', error);
            // Navigate to dashboard anyway
            navigate('/dashboard');
          }
        },
        onFailure: (error) => {
          console.error('Payment failed:', error);
          alert('Payment failed: ' + (error.message || 'Unknown error'));
          setPaymentProcessing(false);
        },
        onDismiss: () => {
          setPaymentProcessing(false);
        }
      });

    } catch (error) {
      console.error('Error initializing Razorpay:', error);
      alert('Payment initialization failed. Please try again.');
      setPaymentProcessing(false);
    }
  };

  const createInstallments = async (admissionId) => {
    try {
      await axios.post('http://localhost:5000/api/payments/installments', {
        admissionId,
        numberOfInstallments: formData.paymentDetails.numberOfInstallments,
        installmentAmount: formData.paymentDetails.installmentAmount,
        firstInstallmentDate: new Date()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error creating installments:', error);
    }
  };

  const handlePayment = async () => {
    if (!formData.courseDetails.courseId) {
      alert('Please select a course first');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to proceed with payment');
      return;
    }

    // First submit admission form
    await handleSubmit(new Event('submit'), true);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.personalDetails.fullName.trim()) errors.push('Full Name is required');
    if (!formData.personalDetails.mobileNumber.trim()) errors.push('Mobile Number is required');
    if (!formData.personalDetails.dateOfBirth) errors.push('Date of Birth is required');
    if (!formData.personalDetails.gender) errors.push('Gender is required');
    
    if (!formData.address.addressLine1.trim()) errors.push('Address Line 1 is required');
    if (!formData.address.city.trim()) errors.push('City is required');
    if (!formData.address.district.trim()) errors.push('District is required');
    if (!formData.address.pincode.trim()) errors.push('Pincode is required');
    if (!formData.address.state.trim()) errors.push('State is required');
    
    if (!formData.courseDetails.courseId) errors.push('Course is required');
    if (!formData.courseDetails.batchId) errors.push('Batch is required');
    if (!formData.courseDetails.branchId) errors.push('Branch is required');

    return errors;
  };

  const handleSubmit = async (e, isPaymentFlow = false) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    setSubmitting(true);
    try {
      // Create admission data object (not FormData for simple route)
      const admissionData = {
        studentId: formData.studentId,
        personalDetails: formData.personalDetails,
        address: formData.address,
        courseDetails: formData.courseDetails,
        paymentDetails: formData.paymentDetails
      };

      // Use appropriate endpoint based on user role
      const endpoint = user?.role === 'Student' 
        ? 'http://localhost:5000/api/admissions/student'
        : 'http://localhost:5000/api/admissions/admin';
      
      const response = await axios.post(endpoint, admissionData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const admission = response.data.admission;
      
      // Update enrollment status to admitted if there's an enrollment
      if (enrollment) {
        try {
          await axios.put(`http://localhost:5000/api/enrollments/${enrollment._id}/admit`, {
            admissionId: admission._id
          }, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        } catch (error) {
          console.error('Error updating enrollment status:', error);
        }
      }
      
      if (isPaymentFlow) {
        // Initialize payment after admission is created
        const paymentAmount = formData.paymentDetails.paymentType === 'ONE_TIME' 
          ? formData.paymentDetails.totalFees 
          : formData.paymentDetails.installmentAmount;
        
        await initializeRazorpay(
          paymentAmount,
          admission._id,
          formData.paymentDetails.paymentType,
          1
        );
      } else {
        setAdmissionData(admission);
        setShowReceipt(true);
      }
    } catch (error) {
    console.error('Error submitting admission:', error);
    alert('Error submitting admission: ' + (error.response?.data?.message || error.message));
  } finally {
    setSubmitting(false);
  }
};

  const handleDownloadReceipt = () => {
    // Generate PDF receipt (simplified version)
    const receiptContent = generateReceiptContent();
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Admission-Receipt-${admissionData.receiptNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleShareReceipt = () => {
    const receiptContent = generateReceiptContent();
    if (navigator.share) {
      navigator.share({
        title: 'Admission Receipt',
        text: receiptContent
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(receiptContent);
      alert('Receipt copied to clipboard!');
    }
  };

  const generateReceiptContent = () => {
    const isEMI = admissionData?.paymentDetails?.paymentType === 'EMI';
    
    return `
ADMISSION RECEIPT
=================

Smart Institute
${admissionData?.courseDetails?.branchId?.address || ''}

Receipt Number: ${admissionData?.receiptNumber}
Date: ${new Date(admissionData?.createdAt).toLocaleDateString()}

STUDENT DETAILS
----------------
Name: ${admissionData?.personalDetails?.fullName}
Mobile: ${admissionData?.personalDetails?.mobileNumber}
Email: ${admissionData?.personalDetails?.emailId}
Date of Birth: ${new Date(admissionData?.personalDetails?.dateOfBirth).toLocaleDateString()}
Gender: ${admissionData?.personalDetails?.gender}

ADDRESS
--------
${admissionData?.address?.addressLine1}
${admissionData?.address?.addressLine2}
${admissionData?.address?.landmark}
${admissionData?.address?.city}, ${admissionData?.address?.district} - ${admissionData?.address?.pincode}
${admissionData?.address?.state}

COURSE DETAILS
--------------
Course: ${admissionData?.courseDetails?.courseId?.title}
Batch: ${admissionData?.courseDetails?.batchId}
Duration: ${admissionData?.courseDetails?.courseDuration}
Branch: ${admissionData?.courseDetails?.branchId?.name}

PAYMENT DETAILS
---------------
Payment Type: ${admissionData?.paymentDetails?.paymentType || 'ONE_TIME'}
Total Fees: ₹${admissionData?.paymentDetails?.totalFees || 0}
Amount Paid: ₹${admissionData?.paymentDetails?.paidAmount || 0}
Pending Amount: ₹${admissionData?.paymentDetails?.pendingAmount || 0}
Payment Status: ${admissionData?.paymentDetails?.paymentStatus || 'PENDING'}
Payment Mode: ${admissionData?.paymentDetails?.paymentMode || 'Razorpay'}
${admissionData?.paymentDetails?.razorpayOrderId ? `Razorpay Order ID: ${admissionData.paymentDetails.razorpayOrderId}` : ''}
${admissionData?.paymentDetails?.transactionId ? `Transaction ID: ${admissionData.paymentDetails.transactionId}` : ''}

${isEMI ? `
EMI DETAILS
-----------
Number of Installments: ${admissionData?.paymentDetails?.numberOfInstallments || 1}
Installment Amount: ₹${admissionData?.paymentDetails?.installmentAmount || 0}
` : ''}

Total Amount Paid: ₹${admissionData?.paymentDetails?.paidAmount || 0}

Authorized Signature
____________________
    `;
  };

  if (showReceipt && admissionData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Admission Receipt</h1>
              <div className="flex space-x-4">
                <button
                  onClick={handleDownloadReceipt}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={handleShareReceipt}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </button>
              </div>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-blue-600">Smart Institute</h2>
                <p className="text-gray-600">Professional Education & Training</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Receipt Number</p>
                  <p className="font-semibold">{admissionData.receiptNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{new Date(admissionData.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Student Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{admissionData.personalDetails.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mobile</p>
                    <p className="font-medium">{admissionData.personalDetails.mobileNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{admissionData.personalDetails.emailId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">{new Date(admissionData.personalDetails.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Course Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Course</p>
                    <p className="font-medium">{admissionData.courseDetails.courseId?.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{admissionData.courseDetails.courseDuration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Branch</p>
                    <p className="font-medium">{admissionData.courseDetails.branchId?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Course Fees</p>
                    <p className="font-medium">₹{admissionData.courseDetails.courseFees}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Type</p>
                    <p className="font-medium">{admissionData.paymentDetails.paymentType || 'ONE_TIME'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Mode</p>
                    <p className="font-medium">{admissionData.paymentDetails.paymentMode || 'Razorpay'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Fees</p>
                    <p className="font-medium">₹{admissionData.paymentDetails.totalFees || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="font-medium">₹{admissionData.paymentDetails.paidAmount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Amount</p>
                    <p className="font-medium">₹{admissionData.paymentDetails.pendingAmount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-medium">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        admissionData.paymentDetails.paymentStatus === 'PAID' 
                          ? 'bg-green-100 text-green-800' 
                          : admissionData.paymentDetails.paymentStatus === 'PARTIAL'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admissionData.paymentDetails.paymentStatus || 'PENDING'}
                      </span>
                    </p>
                  </div>
                  {admissionData.paymentDetails.razorpayOrderId && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Razorpay Order ID</p>
                      <p className="font-medium">{admissionData.paymentDetails.razorpayOrderId}</p>
                    </div>
                  )}
                  {admissionData.paymentDetails.transactionId && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-medium">{admissionData.paymentDetails.transactionId}</p>
                    </div>
                  )}
                  {admissionData.paymentDetails.paymentType === 'EMI' && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">Number of Installments</p>
                        <p className="font-medium">{admissionData.paymentDetails.numberOfInstallments || 1}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Installment Amount</p>
                        <p className="font-medium">₹{admissionData.paymentDetails.installmentAmount || 0}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t mt-6 pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Authorized Signature</p>
                  <div className="mt-2 border-b-2 border-gray-300 w-48 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Admission Form</h1>
            <p className="text-gray-600 mt-2">Fill in the details below to complete your admission</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Student Details */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Student Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.personalDetails.fullName}
                    onChange={(e) => handleInputChange('personalDetails', 'fullName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.personalDetails.mobileNumber}
                    onChange={(e) => handleInputChange('personalDetails', 'mobileNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email ID
                  </label>
                  <input
                    type="email"
                    value={formData.personalDetails.emailId}
                    onChange={(e) => handleInputChange('personalDetails', 'emailId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.personalDetails.dateOfBirth}
                    onChange={(e) => handleInputChange('personalDetails', 'dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <div className="flex space-x-4">
                    {['Male', 'Female', 'Other'].map((gender) => (
                      <label key={gender} className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value={gender}
                          checked={formData.personalDetails.gender === gender}
                          onChange={(e) => handleInputChange('personalDetails', 'gender', e.target.value)}
                          className="mr-2"
                          required
                        />
                        {gender}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo Upload
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      id="photoUpload"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('photoUpload').click()}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Photo
                    </button>
                    {photoPreview && (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Address */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Address Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 (House / Flat / Building) *
                  </label>
                  <input
                    type="text"
                    value={formData.address.addressLine1}
                    onChange={(e) => handleInputChange('address', 'addressLine1', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2 (Area / Colony / Nagar)
                  </label>
                  <input
                    type="text"
                    value={formData.address.addressLine2}
                    onChange={(e) => handleInputChange('address', 'addressLine2', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={formData.address.landmark}
                    onChange={(e) => handleInputChange('address', 'landmark', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City / District *
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    value={formData.address.district}
                    onChange={(e) => handleInputChange('address', 'district', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={formData.address.pincode}
                    onChange={(e) => handleInputChange('address', 'pincode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    pattern="[0-9]{6}"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Course Details */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Course Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course *
                  </label>
                  <select
                    value={formData.courseDetails.courseId}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title} - {course.code}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch *
                  </label>
                  <select
                    value={formData.courseDetails.batchId}
                    onChange={(e) => handleInputChange('courseDetails', 'batchId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!formData.courseDetails.courseId}
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch *
                  </label>
                  <select
                    value={formData.courseDetails.branchId}
                    onChange={(e) => handleInputChange('courseDetails', 'branchId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={user?.role === 'Branch Admin'}
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Duration
                  </label>
                  <input
                    type="text"
                    value={formData.courseDetails.courseDuration}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Fees
                  </label>
                  <input
                    type="text"
                    value={`₹${formData.courseDetails.courseFees}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Payment Details */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                Payment Details
              </h2>
              
              {/* Payment Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Type *
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="paymentType"
                      value="ONE_TIME"
                      checked={formData.paymentDetails.paymentType === 'ONE_TIME'}
                      onChange={(e) => handlePaymentTypeChange(e.target.value)}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <Wallet className="w-4 h-4 mr-2 text-green-600" />
                      <span>One Time Payment</span>
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="paymentType"
                      value="EMI"
                      checked={formData.paymentDetails.paymentType === 'EMI'}
                      onChange={(e) => handlePaymentTypeChange(e.target.value)}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <Calculator className="w-4 h-4 mr-2 text-blue-600" />
                      <span>EMI / Installment Payment</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Total Fees
                  </label>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{formData.paymentDetails.totalFees.toLocaleString()}
                  </p>
                  {user?.role === 'Student' && (
                    <p className="text-xs text-gray-500 mt-1">Fixed by institute</p>
                  )}
                </div>
                
                {formData.paymentDetails.paymentType === 'EMI' && (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        First Installment
                      </label>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-blue-600">
                          ₹{formData.paymentDetails.installmentAmount.toLocaleString()}
                        </p>
                        {['Super Admin', 'Admin', 'Branch Admin'].includes(user?.role) && (
                          <input
                            type="number"
                            value={formData.paymentDetails.installmentAmount}
                            onChange={(e) => handleInputChange('paymentDetails', 'installmentAmount', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                            min="0"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Remaining Amount
                      </label>
                      <p className="text-2xl font-bold text-orange-600">
                        ₹{(formData.paymentDetails.totalFees - formData.paymentDetails.installmentAmount).toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Admin Controls */}
              {['Super Admin', 'Admin', 'Branch Admin'].includes(user?.role) && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Admin Controls</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Editable Total Fees
                      </label>
                      <input
                        type="number"
                        value={formData.paymentDetails.totalFees}
                        onChange={(e) => {
                          const newTotal = parseFloat(e.target.value) || 0;
                          setFormData(prev => ({
                            ...prev,
                            paymentDetails: {
                              ...prev.paymentDetails,
                              totalFees: newTotal,
                              pendingAmount: newTotal - prev.paymentDetails.paidAmount,
                              installmentAmount: prev.paymentDetails.paymentType === 'EMI' 
                                ? Math.ceil(newTotal / prev.paymentDetails.numberOfInstallments)
                                : newTotal
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Mode Override
                      </label>
                      <select
                        value={formData.paymentDetails.paymentMode}
                        onChange={(e) => handleInputChange('paymentDetails', 'paymentMode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="Razorpay">Razorpay</option>
                        <option value="Cash">Cash</option>
                        <option value="PhonePe">PhonePe</option>
                        <option value="Google Pay">Google Pay</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* EMI Options */}
              {formData.paymentDetails.paymentType === 'EMI' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Installments *
                  </label>
                  <select
                    value={formData.paymentDetails.numberOfInstallments}
                    onChange={(e) => handleInstallmentsChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={2}>2 Installments</option>
                    <option value={3}>3 Installments</option>
                    <option value={6}>6 Installments</option>
                    <option value={9}>9 Installments</option>
                    <option value={12}>12 Installments</option>
                  </select>
                </div>
              )}

              {/* EMI Schedule Preview */}
              {showEmiPreview && emiSchedule.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Installment Schedule
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">Installment No</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Due Date</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emiSchedule.map((installment) => (
                          <tr key={installment.installmentNo}>
                            <td className="border border-gray-300 px-4 py-2">{installment.installmentNo}</td>
                            <td className="border border-gray-300 px-4 py-2">₹{installment.amount.toLocaleString()}</td>
                            <td className="border border-gray-300 px-4 py-2">{installment.dueDate}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                installment.status === 'DUE NOW' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {installment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Method Display */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold text-blue-600">Razorpay (Secure Payment Gateway)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Amount to Pay</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{formData.paymentDetails.paymentType === 'ONE_TIME' 
                        ? formData.paymentDetails.totalFees.toLocaleString()
                        : formData.paymentDetails.installmentAmount.toLocaleString()
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={handlePayment}
                disabled={submitting || paymentProcessing || !formData.courseDetails.courseId}
                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {paymentProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay & Submit Admission
                  </>
                )}
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Without Payment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdmissionForm;
