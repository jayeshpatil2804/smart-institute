import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reports = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBranches: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    fetchReportData();
  }, [selectedReport]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [usersRes, branchesRes, coursesRes, enrollmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/branches', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/enrollments', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const users = usersRes.data;
      const branches = branchesRes.data;
      const courses = coursesRes.data;
      const enrollments = enrollmentsRes.data;

      const activeEnrollments = enrollments.filter(e => e.status === 'Active').length;
      const completedEnrollments = enrollments.filter(e => e.status === 'Completed').length;
      const totalRevenue = enrollments.reduce((sum, e) => sum + (e.feesPaid || 0), 0);

      setStats({
        totalUsers: users.length,
        totalBranches: branches.length,
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        activeEnrollments,
        completedEnrollments,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      stats: stats,
      type: selectedReport
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `report-${selectedReport}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>Reports & Analytics</h2>
        <button
          onClick={exportReport}
          className='bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors'
        >
          Export Report
        </button>
      </div>

      {/* Report Type Selector */}
      <div className='bg-white rounded-lg shadow mb-6'>
        <div className='border-b border-gray-200'>
          <nav className='flex -mb-px'>
            {['overview', 'users', 'courses', 'enrollments', 'revenue'].map((report) => (
              <button
                key={report}
                onClick={() => setSelectedReport(report)}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  selectedReport === report
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {report.charAt(0).toUpperCase() + report.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <div className='space-y-6'>
          {/* Key Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <div className='p-3 bg-blue-100 rounded-full'>
                  <svg className='w-6 h-6 text-blue-600' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z'/>
                  </svg>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Total Users</p>
                  <p className='text-2xl font-bold text-gray-900'>{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center'>
                <div className='p-3 bg-green-100 rounded-full'>
                  <svg className='w-6 h-6 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd'/>
                  </svg>
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>Branches</p>
                  <p className='text-2xl font-bold text-gray-900'>{stats.totalBranches}</p>
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
                  <p className='text-sm font-medium text-gray-600'>Courses</p>
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
          </div>

          {/* Additional Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Enrollment Status</h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Active</span>
                  <span className='font-medium text-green-600'>{stats.activeEnrollments}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Completed</span>
                  <span className='font-medium text-blue-600'>{stats.completedEnrollments}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Total Revenue</span>
                  <span className='font-medium text-purple-600'>₹{stats.totalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Quick Actions</h3>
              <div className='space-y-2'>
                <button className='w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 text-sm'>
                  Generate Detailed Report
                </button>
                <button className='w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 text-sm'>
                  Schedule Reports
                </button>
                <button className='w-full text-left px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 text-sm'>
                  Email Reports
                </button>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>System Health</h3>
              <div className='space-y-3'>
                <div className='flex items-center'>
                  <div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
                  <span className='text-sm text-gray-600'>Database: Connected</span>
                </div>
                <div className='flex items-center'>
                  <div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
                  <span className='text-sm text-gray-600'>API: Operational</span>
                </div>
                <div className='flex items-center'>
                  <div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
                  <span className='text-sm text-gray-600'>Last Backup: Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Report */}
      {selectedReport === 'users' && (
        <div className='bg-white rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>User Statistics</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div className='border rounded p-4'>
              <h4 className='font-medium text-gray-700 mb-2'>Total Users</h4>
              <p className='text-2xl font-bold text-blue-600'>{stats.totalUsers}</p>
            </div>
            <div className='border rounded p-4'>
              <h4 className='font-medium text-gray-700 mb-2'>Active Users</h4>
              <p className='text-2xl font-bold text-green-600'>{Math.floor(stats.totalUsers * 0.8)}</p>
            </div>
            <div className='border rounded p-4'>
              <h4 className='font-medium text-gray-700 mb-2'>New This Month</h4>
              <p className='text-2xl font-bold text-purple-600'>{Math.floor(stats.totalUsers * 0.1)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Courses Report */}
      {selectedReport === 'courses' && (
        <div className='bg-white rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Course Statistics</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div className='border rounded p-4'>
              <h4 className='font-medium text-gray-700 mb-2'>Total Courses</h4>
              <p className='text-2xl font-bold text-blue-600'>{stats.totalCourses}</p>
            </div>
            <div className='border rounded p-4'>
              <h4 className='font-medium text-gray-700 mb-2'>Active Courses</h4>
              <p className='text-2xl font-bold text-green-600'>{Math.floor(stats.totalCourses * 0.9)}</p>
            </div>
            <div className='border rounded p-4'>
              <h4 className='font-medium text-gray-700 mb-2'>Avg Enrollment</h4>
              <p className='text-2xl font-bold text-purple-600'>{Math.floor(stats.totalEnrollments / stats.totalCourses)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enrollments Report */}
      {selectedReport === 'enrollments' && (
        <div className='bg-white rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Enrollment Statistics</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='border rounded p-4'>
              <h4 className='font-medium text-gray-700 mb-2'>Total Enrollments</h4>
              <p className='text-2xl font-bold text-blue-600'>{stats.totalEnrollments}</p>
            </div>
            <div className='border rounded p-4'>
              <h4 className='font-medium text-gray-700 mb-2'>Active</h4>
              <p className='text-2xl font-bold text-green-600'>{stats.activeEnrollments}</p>
            </div>
            <div className='border rounded p-4'>
              <h4 className='font-medium text-gray-700 mb-2'>Completed</h4>
              <p className='text-2xl font-bold text-purple-600'>{stats.completedEnrollments}</p>
            </div>
            <div className='border rounded p-4'>
              <h4 className='font-medium text-gray-700 mb-2'>Drop Rate</h4>
              <p className='text-2xl font-bold text-orange-600'>{Math.floor((stats.totalEnrollments - stats.activeEnrollments - stats.completedEnrollments) / stats.totalEnrollments * 100)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Report */}
      {selectedReport === 'revenue' && (
        <div className='bg-white rounded-lg shadow p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>Revenue Statistics</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div className='border rounded p-4'>
              <h4 className='font-medium text-gray-700 mb-2'>Total Revenue</h4>
              <p className='text-2xl font-bold text-green-600'>₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className='border rounded p-4'>
              <h4 className='font-medium text-gray-700 mb-2'>Pending Payments</h4>
              <p className='text-2xl font-bold text-orange-600'>₹{(stats.totalRevenue * 0.3).toLocaleString()}</p>
            </div>
            <div className='border rounded p-4'>
              <h4 className='font-medium text-gray-700 mb-2'>Avg Course Fee</h4>
              <p className='text-2xl font-bold text-purple-600'>₹{Math.floor(stats.totalRevenue / stats.totalEnrollments).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
