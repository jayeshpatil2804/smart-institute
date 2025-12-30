import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BranchAdminGallery from '../BranchAdminGallery';
import EnrollmentManagement from '../admin/EnrollmentManagement';
import MasterDropdown from '../master/MasterDropdown';

const BranchAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    pendingEnrollments: 0,
    admittedEnrollments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const branchId = user?.branch?._id;
      const token = localStorage.getItem('token');
      const requests = [
        axios.get('http://localhost:5000/api/staff'),
        axios.get('http://localhost:5000/api/users'),
        axios.get('http://localhost:5000/api/courses')
      ];
      
      // Only add enrollment request if token exists
      if (token) {
        requests.push(
          axios.get('http://localhost:5000/api/enrollments/dashboard', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }).catch(err => {
            console.warn('Enrollment stats failed, using defaults:', err.message);
            return { data: { total: 0, enrolledNotAdmitted: [], admitted: [] } };
          })
        );
      } else {
        requests.push(Promise.resolve({ data: { total: 0, enrolledNotAdmitted: [], admitted: [] } }));
      }

      const [staffRes, studentsRes, coursesRes, enrollmentsRes] = await Promise.all(requests);

      const enrollmentData = enrollmentsRes.data;
      
      setStats({
        totalStaff: staffRes.data.filter(s => s.branch._id === branchId).length,
        totalStudents: studentsRes.data.filter(s => s.role === 'Student' && s.branch._id === branchId).length,
        totalCourses: coursesRes.data.filter(c => c.branches.includes(branchId)).length,
        totalEnrollments: enrollmentData.total || 0,
        pendingEnrollments: enrollmentData.enrolledNotAdmitted?.length || 0,
        admittedEnrollments: enrollmentData.admitted?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default values on error
      setStats({
        totalStaff: 0,
        totalStudents: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        pendingEnrollments: 0,
        admittedEnrollments: 0
      });
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
            Branch Admin Dashboard
          </h1>
          <p className='text-gray-600 mt-1'>
            {user?.branch?.name} Branch - Welcome back, {user?.firstName} {user?.lastName}
          </p>
        </div>

        {/* Navigation */}
        <div className='bg-white border-b'>
          <div className='container mx-auto px-4'>
            <nav className='flex space-x-8 overflow-x-auto'>
              <button
                onClick={() => setActiveSection('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveSection('enrollments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === 'enrollments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Enrollments
              </button>
              <button
                onClick={() => setActiveSection('gallery')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === 'gallery'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Gallery
              </button>
              <MasterDropdown />
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className='container mx-auto px-4 py-8'>
          {activeSection === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                <div className='bg-white rounded-lg shadow p-6'>
                  <div className='flex items-center'>
                    <div className='p-3 bg-blue-100 rounded-full'>
                      <svg className='w-6 h-6 text-blue-600' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0116 13a22.95 22.95 0 01-8 1.57V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z' clipRule='evenodd'/>
                        <path d='M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z'/>
                      </svg>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>Total Staff</p>
                      <p className='text-2xl font-bold text-gray-900'>{stats.totalStaff}</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow p-6'>
                  <div className='flex items-center'>
                    <div className='p-3 bg-green-100 rounded-full'>
                      <svg className='w-6 h-6 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z'/>
                      </svg>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>Total Students</p>
                      <p className='text-2xl font-bold text-gray-900'>{stats.totalStudents}</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow p-6'>
                  <div className='flex items-center'>
                    <div className='p-3 bg-purple-100 rounded-full'>
                      <svg className='w-6 h-6 text-purple-600' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z'/>
                      </svg>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>Active Courses</p>
                      <p className='text-2xl font-bold text-gray-900'>{stats.totalCourses}</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow p-6'>
                  <div className='flex items-center'>
                    <div className='p-3 bg-orange-100 rounded-full'>
                      <svg className='w-6 h-6 text-orange-600' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z'/>
                        <path fillRule='evenodd' d='M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100-4h-.5a1 1 0 000-2H8a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5z' clipRule='evenodd'/>
                      </svg>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>Total Enrollments</p>
                      <p className='text-2xl font-bold text-gray-900'>{stats.totalEnrollments}</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow p-6'>
                  <div className='flex items-center'>
                    <div className='p-3 bg-yellow-100 rounded-full'>
                      <svg className='w-6 h-6 text-yellow-600' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd'/>
                      </svg>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>Pending Admissions</p>
                      <p className='text-2xl font-bold text-gray-900'>{stats.pendingEnrollments}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className='mt-8'>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>Branch Management</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  <button 
                    onClick={() => setActiveSection('enrollments')}
                    className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'
                  >
                    <h3 className='font-semibold text-gray-900 mb-2'>Manage Enrollments</h3>
                    <p className='text-gray-600 text-sm'>Review student enrollments and admissions</p>
                  </button>
                  <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
                    <h3 className='font-semibold text-gray-900 mb-2'>Staff Management</h3>
                    <p className='text-gray-600 text-sm'>Add, edit, or manage branch staff</p>
                  </button>
                  <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
                    <h3 className='font-semibold text-gray-900 mb-2'>Student Management</h3>
                    <p className='text-gray-600 text-sm'>Manage student enrollments and records</p>
                  </button>
                  <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
                    <h3 className='font-semibold text-gray-900 mb-2'>Course Allocation</h3>
                    <p className='text-gray-600 text-sm'>Assign courses to teachers and students</p>
                  </button>
                  <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
                    <h3 className='font-semibold text-gray-900 mb-2'>Fees Overview</h3>
                    <p className='text-gray-600 text-sm'>View fee collection and pending payments</p>
                  </button>
                  <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
                    <h3 className='font-semibold text-gray-900 mb-2'>Branch Profile</h3>
                    <p className='text-gray-600 text-sm'>Update branch information and settings</p>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className='mt-8'>
                <h2 className='text-xl font-bold text-gray-900 mb-4'>Recent Activity</h2>
                <div className='bg-white rounded-lg shadow'>
                  <div className='p-6'>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between py-3 border-b'>
                        <div>
                          <p className='font-medium text-gray-900'>New student enrolled</p>
                          <p className='text-sm text-gray-600'>John Doe - Computer Basics Course</p>
                        </div>
                        <span className='text-sm text-gray-500'>2 hours ago</span>
                      </div>
                      <div className='flex items-center justify-between py-3 border-b'>
                        <div>
                          <p className='font-medium text-gray-900'>Fee payment received</p>
                          <p className='text-sm text-gray-600'>Jane Smith - ₹5,000</p>
                        </div>
                        <span className='text-sm text-gray-500'>4 hours ago</span>
                      </div>
                      <div className='flex items-center justify-between py-3'>
                        <div>
                          <p className='font-medium text-gray-900'>New staff joined</p>
                          <p className='text-sm text-gray-600'>Mr. Raj Kumar - Mathematics Teacher</p>
                        </div>
                        <span className='text-sm text-gray-500'>1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === 'enrollments' && <EnrollmentManagement />}
          {activeSection === 'gallery' && <BranchAdminGallery />}
        </div>
      </div>
    </div>
  );
};

export default BranchAdminDashboard;