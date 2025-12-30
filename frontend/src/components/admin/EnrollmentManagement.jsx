import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState({
    enrolledNotAdmitted: [],
    admitted: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pending');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found');
        setEnrollments({ enrolledNotAdmitted: [], admitted: [] });
        setLoading(false);
        return;
      }

      // Try the main dashboard endpoint first
      let response;
      try {
        response = await axios.get('http://localhost:5000/api/enrollments/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (dashboardError) {
        console.warn('Dashboard endpoint failed, trying simple-test:', dashboardError.message);
        // Fallback to simple-test endpoint
        response = await axios.get('http://localhost:5000/api/enrollments/simple-test', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      console.log('Enrollment response:', response.data);
      
      // Handle different response formats
      let enrollmentsData = { enrolledNotAdmitted: [], admitted: [] };
      
      if (response.data.enrollments && Array.isArray(response.data.enrollments)) {
        // Simple test endpoint returns array directly
        enrollmentsData.enrolledNotAdmitted = response.data.enrollments.filter(e => 
          e.enrollmentStatus === 'ENROLLED_NOT_ADMITTED'
        );
        enrollmentsData.admitted = response.data.enrollments.filter(e => 
          e.enrollmentStatus === 'ADMITTED'
        );
      } else if (response.data.enrollments && typeof response.data.enrollments === 'object') {
        // Dashboard endpoint format
        enrollmentsData = response.data.enrollments;
      }
      
      setEnrollments(enrollmentsData);
      
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      console.error('Error response:', error.response?.data);
      
      // Set empty enrollments on error
      setEnrollments({ enrolledNotAdmitted: [], admitted: [] });
      
      // Show user-friendly error message
      if (error.response?.status === 500) {
        console.warn('Server error, using empty data');
      } else if (error.response?.status === 401) {
        console.warn('Authentication error, please login again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdmissionForm = (enrollment) => {
    // Navigate to admission form with enrollment data
    window.open(`/admission-form`, '_blank');
  };

  const getStatusBadge = (status) => {
    return status === 'ENROLLED_NOT_ADMITTED' ? (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
        Enrolled (Pending Admission)
      </span>
    ) : (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
        Admitted
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">New Course Enrollments</h2>
        <p className="text-gray-600 mt-1">Manage student enrollments and admission process</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('pending')}
              className={`px-6 py-3 font-medium text-sm ${
                selectedTab === 'pending'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Enrolled (Not Admitted) ({enrollments.enrolledNotAdmitted.length})
            </button>
            <button
              onClick={() => setSelectedTab('admitted')}
              className={`px-6 py-3 font-medium text-sm ${
                selectedTab === 'admitted'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Admitted ({enrollments.admitted.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {selectedTab === 'pending' && (
          <div className="p-6">
            {enrollments.enrolledNotAdmitted.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrollment Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enrollments.enrolledNotAdmitted.map((enrollment) => (
                      <tr key={enrollment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.student?.firstName} {enrollment.student?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{enrollment.student?.email}</div>
                            <div className="text-sm text-gray-500">{enrollment.student?.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{enrollment.course?.title}</div>
                            <div className="text-sm text-gray-500">{enrollment.course?.code}</div>
                            <div className="text-sm text-gray-500">₹{enrollment.course?.fees?.toLocaleString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{enrollment.branch?.name}</div>
                          <div className="text-sm text-gray-500">{enrollment.branch?.code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 
                           enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 
                           'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(enrollment.enrollmentStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleOpenAdmissionForm(enrollment)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Open Admission Form
                            </button>
                            <button
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending enrollments</h3>
                <p className="mt-1 text-sm text-gray-500">All students have been admitted</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'admitted' && (
          <div className="p-6">
            {enrollments.admitted.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admission Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enrollments.admitted.map((enrollment) => (
                      <tr key={enrollment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.student?.firstName} {enrollment.student?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{enrollment.student?.email}</div>
                            <div className="text-sm text-gray-500">{enrollment.student?.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{enrollment.course?.title}</div>
                            <div className="text-sm text-gray-500">{enrollment.course?.code}</div>
                            <div className="text-sm text-gray-500">₹{enrollment.course?.fees?.toLocaleString()}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{enrollment.branch?.name}</div>
                          <div className="text-sm text-gray-500">{enrollment.branch?.code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 
                           enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 
                           'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(enrollment.enrollmentStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                              View Details
                            </button>
                            <button
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Verify Payment
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No admitted students</h3>
                <p className="mt-1 text-sm text-gray-500">No students have completed admission yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentManagement;
