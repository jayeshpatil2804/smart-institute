import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    assignedCourses: 0,
    totalStudents: 0,
    todayClasses: 0,
    pendingGrades: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      // Mock data for teacher's courses and students
      // In real implementation, these would come from API endpoints
      const mockCourses = [
        { id: 1, title: 'Web Development', code: 'WD101', students: 25, schedule: 'Mon, Wed, Fri - 9:00 AM' },
        { id: 2, title: 'JavaScript Advanced', code: 'JS201', students: 18, schedule: 'Tue, Thu - 2:00 PM' },
        { id: 3, title: 'React.js Fundamentals', code: 'RE301', students: 22, schedule: 'Sat - 10:00 AM' }
      ];

      const mockStudents = [
        { id: 1, name: 'John Doe', course: 'Web Development', attendance: 85, grade: 'A' },
        { id: 2, name: 'Jane Smith', course: 'Web Development', attendance: 92, grade: 'A+' },
        { id: 3, name: 'Mike Johnson', course: 'JavaScript Advanced', attendance: 78, grade: 'B+' },
        { id: 4, name: 'Sarah Wilson', course: 'React.js Fundamentals', attendance: 95, grade: 'A' }
      ];

      setCourses(mockCourses);
      setStudents(mockStudents);
      
      setStats({
        assignedCourses: mockCourses.length,
        totalStudents: mockStudents.length,
        todayClasses: 2,
        pendingGrades: 5
      });
    } catch (error) {
      console.error('Error fetching teacher data:', error);
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
            Teacher Dashboard
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
                  <path d='M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Assigned Courses</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.assignedCourses}</p>
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
              <div className='p-3 bg-orange-100 rounded-full'>
                <svg className='w-6 h-6 text-orange-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Today's Classes</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.todayClasses}</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-purple-100 rounded-full'>
                <svg className='w-6 h-6 text-purple-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z'/>
                  <path fillRule='evenodd' d='M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100-4h-.5a1 1 0 000-2H8a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5z' clipRule='evenodd'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Pending Grades</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.pendingGrades}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Teaching Tools</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Take Attendance</h3>
              <p className='text-gray-600 text-sm'>Mark student attendance</p>
            </button>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Grade Students</h3>
              <p className='text-gray-600 text-sm'>Submit grades and evaluations</p>
            </button>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Course Materials</h3>
              <p className='text-gray-600 text-sm'>Upload study materials</p>
            </button>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Assignments</h3>
              <p className='text-gray-600 text-sm'>Create and manage assignments</p>
            </button>
          </div>
        </div>

        {/* Assigned Courses */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>My Courses</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {courses.map(course => (
              <div key={course.id} className='bg-white rounded-lg shadow p-6'>
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <h3 className='font-semibold text-gray-900'>{course.title}</h3>
                    <p className='text-sm text-gray-600'>{course.code}</p>
                  </div>
                  <span className='bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded'>
                    Active
                  </span>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Students Enrolled</span>
                    <span className='font-medium'>{course.students}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Schedule</span>
                    <span className='font-medium'>{course.schedule}</span>
                  </div>
                </div>
                <div className='mt-4 flex space-x-2'>
                  <button className='flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700'>
                    View Details
                  </button>
                  <button className='flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-300'>
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student List */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Recent Students</h2>
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Student Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Course
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Attendance
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Grade
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {student.name}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {student.course}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='text-sm text-gray-900'>{student.attendance}%</div>
                          <div className='ml-2 w-16 bg-gray-200 rounded-full h-2'>
                            <div 
                              className="h-2 rounded-full"
                              style={{ width: `${student.attendance}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                          {student.grade}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <button className='text-blue-600 hover:text-blue-900 mr-3'>View</button>
                        <button className='text-gray-600 hover:text-gray-900'>Grade</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Today's Schedule</h2>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='space-y-4'>
              <div className='flex items-center p-4 bg-blue-50 rounded-lg'>
                <div className='flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold'>
                  9A
                </div>
                <div className='ml-4 flex-1'>
                  <h3 className='font-semibold text-gray-900'>Web Development</h3>
                  <p className='text-sm text-gray-600'>Room 101 - 25 students</p>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium text-gray-900'>9:00 AM - 12:00 PM</p>
                  <p className='text-xs text-green-600'>Upcoming</p>
                </div>
              </div>

              <div className='flex items-center p-4 bg-green-50 rounded-lg'>
                <div className='flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold'>
                  2P
                </div>
                <div className='ml-4 flex-1'>
                  <h3 className='font-semibold text-gray-900'>JavaScript Advanced</h3>
                  <p className='text-sm text-gray-600'>Room 205 - 18 students</p>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-medium text-gray-900'>2:00 PM - 5:00 PM</p>
                  <p className='text-xs text-blue-600'>Scheduled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;