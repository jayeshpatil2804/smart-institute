import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const AccountantDashboard = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalCollected: 0,
    pendingAmount: 0,
    todayCollection: 0,
    monthlyCollection: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const fetchPaymentsData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/payments');
      const allPayments = response.data;
      const branchPayments = allPayments.filter(p => p.branch._id === user?.branch?._id);
      
      setPayments(branchPayments);
      
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const todayPayments = branchPayments.filter(p => 
        new Date(p.paymentDate).toDateString() === today.toDateString()
      );
      
      const monthlyPayments = branchPayments.filter(p => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear;
      });
      
      setStats({
        totalCollected: branchPayments.reduce((sum, p) => sum + p.amount, 0),
        pendingAmount: 0, // Would need enrollment data to calculate
        todayCollection: todayPayments.reduce((sum, p) => sum + p.amount, 0),
        monthlyCollection: monthlyPayments.reduce((sum, p) => sum + p.amount, 0)
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
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
      {/* Header */}
      <div className='bg-white shadow'>
        <div className='container mx-auto px-4 py-6'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Accountant Dashboard
          </h1>
          <p className='text-gray-600 mt-1'>
            Welcome, {user?.firstName} {user?.lastName}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-green-100 rounded-full'>
                <svg className='w-6 h-6 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z'/>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z' clipRule='evenodd'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Total Collected</p>
                <p className='text-2xl font-bold text-gray-900'>
                  ₹{stats.totalCollected.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-orange-100 rounded-full'>
                <svg className='w-6 h-6 text-orange-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z' clipRule='evenodd'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Pending Amount</p>
                <p className='text-2xl font-bold text-gray-900'>
                  ₹{stats.pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-blue-100 rounded-full'>
                <svg className='w-6 h-6 text-blue-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' clipRule='evenodd'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Today's Collection</p>
                <p className='text-2xl font-bold text-gray-900'>
                  ₹{stats.todayCollection.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-purple-100 rounded-full'>
                <svg className='w-6 h-6 text-purple-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.293a1 1 0 00-1.414 0L10 10.586 8.707 9.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 12.414l1.293 1.293a1 1 0 001.414 0l4-4z' clipRule='evenodd'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Monthly Collection</p>
                <p className='text-2xl font-bold text-gray-900'>
                  ₹{stats.monthlyCollection.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Financial Management</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Fee Collection</h3>
              <p className='text-gray-600 text-sm'>Record student fee payments</p>
            </button>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Invoices</h3>
              <p className='text-gray-600 text-sm'>Generate and manage invoices</p>
            </button>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Payment History</h3>
              <p className='text-gray-600 text-sm'>View payment records</p>
            </button>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Reports</h3>
              <p className='text-gray-600 text-sm'>Generate financial reports</p>
            </button>
          </div>
        </div>

        {/* Recent Payments */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Recent Payments</h2>
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            {payments.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Receipt No.
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Student
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Amount
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Method
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Date
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {payments.slice(0, 10).map(payment => (
                      <tr key={payment._id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {payment.receiptNumber}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {payment.student?.firstName} {payment.student?.lastName}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          ₹{payment.amount.toLocaleString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {payment.paymentMethod}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'>
                            {payment.status}
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

        {/* Payment Methods Summary */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Payment Methods Summary</h2>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
              {['Cash', 'Cheque', 'Online Transfer', 'UPI', 'Credit Card', 'Debit Card'].map(method => {
                const methodPayments = payments.filter(p => p.paymentMethod === method);
                const total = methodPayments.reduce((sum, p) => sum + p.amount, 0);
                
                return (
                  <div key={method} className='text-center'>
                    <div className='text-lg font-bold text-gray-900'>
                      ₹{total.toLocaleString()}
                    </div>
                    <div className='text-sm text-gray-600'>{method}</div>
                    <div className='text-xs text-gray-500'>
                      {methodPayments.length} transactions
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;