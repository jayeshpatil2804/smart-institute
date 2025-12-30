import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const [enrollmentsRes, paymentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/enrollments'),
        axios.get('http://localhost:5000/api/payments')
      ]);

      setEnrollments(enrollmentsRes.data.filter(e => e.student._id === user._id));
      setPayments(paymentsRes.data.filter(p => p.student._id === user._id));
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                Smart Institute
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Home
              </Link>
              <Link
                to="/courses"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Courses
              </Link>
              <Link
                to="/about"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                About
              </Link>
              <Link
                to="/gallery"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Gallery
              </Link>
              <Link
                to="/contact"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Contact
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  // Handle logout
                  localStorage.removeItem('token');
                  navigate('/login');
                }}
                className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className='bg-white shadow rounded-lg p-6 mb-8'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Student Dashboard
          </h1>
          <p className='text-gray-600 mt-1'>
            Welcome, {user?.firstName} {user?.lastName}
          </p>
        </div>

      {/* Student Info Card */}
      <div className='bg-white rounded-lg shadow p-6 mb-8'>
        <div className='flex items-center'>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>
              {user?.firstName} {user?.lastName}
            </h2>
            <p className='text-gray-600'>{user?.email}</p>
            <p className='text-gray-600'>{user?.phone}</p>
            <p className='text-sm text-gray-500 mt-1'>
              Branch: {user?.branch?.name}
            </p>
          </div>
        </div>
      </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-blue-100 rounded-full'>
                <svg className='w-6 h-6 text-blue-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Enrolled Courses</p>
                <p className='text-2xl font-bold text-gray-900'>{enrollments.length}</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-green-100 rounded-full'>
                <svg className='w-6 h-6 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z'/>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z' clipRule='evenodd'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Total Fees Paid</p>
                <p className='text-2xl font-bold text-gray-900'>
                  ₹{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-orange-100 rounded-full'>
                <svg className='w-6 h-6 text-orange-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' clipRule='evenodd'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Pending Fees</p>
                <p className='text-2xl font-bold text-gray-900'>
                  ₹{enrollments.reduce((sum, e) => sum + (e.balanceFees || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className='mb-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>My Courses</h2>
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            {enrollments.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Course
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Duration
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Fees
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {enrollments.map(enrollment => (
                      <tr key={enrollment._id}>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>
                            {enrollment.course?.title}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {enrollment.course?.code}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {enrollment.course?.duration} months
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                            {enrollment.status}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          ₹{enrollment.totalFees?.toLocaleString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          ₹{enrollment.balanceFees?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='p-6 text-center text-gray-500'>
                No courses enrolled yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className='mb-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Recent Payments</h2>
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            {payments.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Date
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Amount
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Method
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {payments.slice(0, 5).map(payment => (
                      <tr key={payment._id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          ₹{payment.amount.toLocaleString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {payment.paymentMethod}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                            { payment.status }
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='p-6 text-center text-gray-500'>
                No payment records found
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Quick Actions</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Link to="/courses" className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Browse Courses</h3>
              <p className='text-gray-600 text-sm'>Explore available courses</p>
            </Link>
            <Link to="/courses" className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Enroll in Courses</h3>
              <p className='text-gray-600 text-sm'>View and enroll in courses</p>
            </Link>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Make Payment</h3>
              <p className='text-gray-600 text-sm'>Pay your pending fees</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;