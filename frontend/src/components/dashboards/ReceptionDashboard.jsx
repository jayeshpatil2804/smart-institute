import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ReceptionDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingEnquiries: 0,
    newRegistrations: 0,
    totalVisitors: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceptionData();
  }, []);

  const fetchReceptionData = async () => {
    try {
      // Mock data for appointments and enquiries
      // In real implementation, these would come from API endpoints
      const mockAppointments = [
        { id: 1, visitorName: 'John Doe', purpose: 'Course Inquiry', time: '10:00 AM', status: 'Scheduled' },
        { id: 2, visitorName: 'Jane Smith', purpose: 'Admission', time: '11:30 AM', status: 'Checked In' },
        { id: 3, visitorName: 'Mike Johnson', purpose: 'Fee Payment', time: '2:00 PM', status: 'Pending' }
      ];

      const mockEnquiries = [
        { id: 1, name: 'Sarah Wilson', phone: '9876543210', course: 'Computer Basics', status: 'New', date: new Date() },
        { id: 2, name: 'Tom Brown', phone: '9876543211', course: 'Web Development', status: 'Contacted', date: new Date() }
      ];

      setAppointments(mockAppointments);
      setEnquiries(mockEnquiries);
      
      setStats({
        todayAppointments: mockAppointments.length,
        pendingEnquiries: mockEnquiries.filter(e => e.status === 'New').length,
        newRegistrations: 5,
        totalVisitors: 25
      });
    } catch (error) {
      console.error('Error fetching reception data:', error);
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
            Reception Dashboard
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
              <div className='p-3 bg-blue-100 rounded-full'>
                <svg className='w-6 h-6 text-blue-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' clipRule='evenodd'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Today's Appointments</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.todayAppointments}</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-orange-100 rounded-full'>
                <svg className='w-6 h-6 text-orange-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z' clipRule='evenodd'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Pending Enquiries</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.pendingEnquiries}</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-green-100 rounded-full'>
                <svg className='w-6 h-6 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clipRule='evenodd'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>New Registrations</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.newRegistrations}</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-purple-100 rounded-full'>
                <svg className='w-6 h-6 text-purple-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Total Visitors Today</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.totalVisitors}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Quick Actions</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Student Registration</h3>
              <p className='text-gray-600 text-sm'>Register new students</p>
            </button>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Enquiry Entry</h3>
              <p className='text-gray-600 text-sm'>Record visitor enquiries</p>
            </button>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Appointments</h3>
              <p className='text-gray-600 text-sm'>Schedule appointments</p>
            </button>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Visitor Log</h3>
              <p className='text-gray-600 text-sm'>Manage visitor records</p>
            </button>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Today's Appointments</h2>
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            {appointments.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Visitor Name
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Purpose
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Time
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {appointments.map(appointment => (
                      <tr key={appointment.id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {appointment.visitorName}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {appointment.purpose}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {appointment.time}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                            {appointment.status}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                          <button className='text-blue-600 hover:text-blue-900 mr-3'>Check In</button>
                          <button className='text-gray-600 hover:text-gray-900'>Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='p-6 text-center text-gray-500'>
                No appointments scheduled for today
              </div>
            )}
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Recent Enquiries</h2>
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            {enquiries.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Name
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Phone
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Course Interest
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {enquiries.map(enquiry => (
                      <tr key={enquiry.id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {enquiry.name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {enquiry.phone}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {enquiry.course}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                            {enquiry.status}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                          <button className='text-blue-600 hover:text-blue-900 mr-3'>Contact</button>
                          <button className='text-gray-600 hover:text-gray-900'>Convert</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='p-6 text-center text-gray-500'>
                No recent enquiries
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Today's Overview</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='font-semibold text-gray-900 mb-4'>Visitor Types</h3>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>New Students</span>
                  <span className='text-sm font-medium'>8</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Parents</span>
                  <span className='text-sm font-medium'>5</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>General Visitors</span>
                  <span className='text-sm font-medium'>12</span>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='font-semibold text-gray-900 mb-4'>Popular Courses</h3>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Computer Basics</span>
                  <span className='text-sm font-medium'>15</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Web Development</span>
                  <span className='text-sm font-medium'>8</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>Digital Marketing</span>
                  <span className='text-sm font-medium'>6</span>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='font-semibold text-gray-900 mb-4'>Peak Hours</h3>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>9:00 AM - 12:00 PM</span>
                  <span className='text-sm font-medium'>18</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>12:00 PM - 3:00 PM</span>
                  <span className='text-sm font-medium'>7</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-600'>3:00 PM - 6:00 PM</span>
                  <span className='text-sm font-medium'>12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionDashboard;