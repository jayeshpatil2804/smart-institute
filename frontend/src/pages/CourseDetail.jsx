import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    fetchCourse();
    fetchBranches();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/courses/${id}`);
      setCourse(response.data);
    } catch (error) {
      console.error('Error fetching course:', error);
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/branches');
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'Student') {
      alert('Only students can enroll in courses');
      return;
    }

    setShowEnrollModal(true);
  };

  const handleConfirmEnrollment = async () => {
    if (!selectedBranch) {
      alert('Please select a branch');
      return;
    }

    setEnrolling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/enrollments/self-enroll',
        {
          course: course._id,
          branch: selectedBranch
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('Enrollment successful! Please contact the institute for payment details.');
      setShowEnrollModal(false);
      setSelectedBranch('');
    } catch (error) {
      console.error('Error enrolling:', error);
      alert(error.response?.data?.message || 'Error enrolling in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>Course not found</h2>
          <button
            onClick={() => navigate('/courses')}
            className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors'
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Hero Section */}
      <div className='bg-blue-900 text-white py-16'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-col lg:flex-row gap-8 items-center'>
            <div className='flex-1'>
              <div className='text-sm text-blue-200 mb-2'>{course.category || 'General'}</div>
              <h1 className='text-3xl md:text-4xl font-bold mb-4'>{course.title || 'Untitled Course'}</h1>
              <p className='text-lg text-blue-100 mb-6'>{course.shortDescription || 'No description available'}</p>
              
              <div className='flex flex-wrap gap-4 mb-6'>
                <div className='flex items-center'>
                  <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd'/>
                  </svg>
                  <span>{course.duration || 0} months</span>
                </div>
                <div className='flex items-center'>
                  <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z'/>
                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z' clipRule='evenodd'/>
                  </svg>
                  <span className='text-2xl font-bold'>₹{course.fees ? Number(course.fees).toLocaleString() : '0'}</span>
                </div>
                <div className='flex items-center'>
                  <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z' clipRule='evenodd'/>
                    <path d='M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z'/>
                  </svg>
                  <span>{course.level || 'Beginner'}</span>
                </div>
              </div>

              <div className='flex flex-wrap gap-2 mb-6'>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  (course.status || 'Active') === 'Featured' ? 'bg-yellow-100 text-yellow-800' :
                  (course.status || 'Active') === 'Upcoming' ? 'bg-gray-100 text-gray-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {course.status || 'Active'}
                </span>
                <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
                  {course.code || 'N/A'}
                </span>
              </div>
            </div>
            
            <div className='lg:w-1/3'>
              <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
                <div className='h-48 bg-gray-200 flex items-center justify-center'>
                  {course.image && course.image.startsWith('http') ? (
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<span class="text-gray-500">Course Image</span>';
                      }}
                    />
                  ) : (
                    <span className='text-gray-500'>Course Image</span>
                  )}
                </div>
                <div className='p-6'>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className='w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3'
                  >
                    {enrolling ? 'Processing...' : 'Enroll Now'}
                  </button>
                  <Link
                    to="/admission"
                    className='w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors block text-center mb-3'
                  >
                    Admission Form
                  </Link>
                  <button
                    onClick={() => navigate('/courses')}
                    className='w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors'
                  >
                    Back to Courses
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2'>
            {/* Description */}
            <section className='bg-white rounded-lg shadow-md p-6 mb-8'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>About this Course</h2>
              <div className='prose max-w-none text-gray-600'>
                <p>{course.description || 'No detailed description available'}</p>
              </div>
            </section>

            {/* Syllabus */}
            {course.syllabus && Array.isArray(course.syllabus) && course.syllabus.length > 0 && (
              <section className='bg-white rounded-lg shadow-md p-6 mb-8'>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>Course Syllabus</h2>
                <div className='space-y-6'>
                  {course.syllabus.map((module, index) => (
                    <div key={index} className='border-l-4 border-blue-500 pl-4'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        {module.module}
                      </h3>
                      <ul className='list-disc list-inside text-gray-600 space-y-1'>
                        {module.topics.map((topic, topicIndex) => (
                          <li key={topicIndex}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Prerequisites */}
            {course.prerequisites && Array.isArray(course.prerequisites) && course.prerequisites.length > 0 && (
              <section className='bg-white rounded-lg shadow-md p-6 mb-8'>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>Prerequisites</h2>
                <ul className='list-disc list-inside text-gray-600 space-y-2'>
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Learning Outcomes */}
            {course.outcomes && Array.isArray(course.outcomes) && course.outcomes.length > 0 && (
              <section className='bg-white rounded-lg shadow-md p-6 mb-8'>
                <h2 className='text-2xl font-bold text-gray-900 mb-4'>What You'll Learn</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {course.outcomes.map((outcome, index) => (
                    <div key={index} className='flex items-start'>
                      <svg className='w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-1' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd'/>
                      </svg>
                      <span className='text-gray-700'>{outcome}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-1'>
            {/* Course Info */}
            <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>Course Information</h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Duration:</span>
                  <span className='font-medium'>{course.duration || 0} months</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Level:</span>
                  <span className='font-medium'>{course.level || 'Beginner'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Category:</span>
                  <span className='font-medium'>{course.category || 'General'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Course Code:</span>
                  <span className='font-medium'>{course.code || 'N/A'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Status:</span>
                  <span className='font-medium'>{course.status || 'Active'}</span>
                </div>
              </div>
            </div>

            {/* Available Branches */}
            {course.branches && Array.isArray(course.branches) && course.branches.length > 0 && (
              <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
                <h3 className='text-lg font-bold text-gray-900 mb-4'>Available Branches</h3>
                <div className='space-y-3'>
                  {course.branches.map((branch) => (
                    <div key={branch._id} className='border-l-4 border-blue-500 pl-3'>
                      <div className='font-medium text-gray-900'>{branch.name || 'Unnamed Branch'}</div>
                      <div className='text-sm text-gray-600'>
                        {branch.address?.street || 'N/A'}, {branch.address?.city || 'N/A'}, {branch.address?.state || 'N/A'} - {branch.address?.pincode || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className='bg-blue-50 rounded-lg p-6'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>Need Help?</h3>
              <p className='text-gray-600 mb-4'>
                Have questions about this course? Our counselors are here to help you.
              </p>
              <div className='space-y-2'>
                <a href='tel:+91-96017-49300' className='flex items-center text-blue-600 hover:text-blue-700'>
                  <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z'/>
                  </svg>
                  +91-96017-49300
                </a>
                <a href='mailto:info@smartinstitute.co.in' className='flex items-center text-blue-600 hover:text-blue-700'>
                  <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z'/>
                    <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z'/>
                  </svg>
                  info@smartinstitute.co.in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
          <div className='relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white'>
            <div className='mt-3'>
              <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                Enroll in {course?.title}
              </h3>
              
              <div className='mb-4'>
                <p className='text-sm text-gray-600 mb-4'>
                  Please select your preferred branch for enrollment:
                </p>
                
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Select Branch *
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  required
                >
                  <option value=''>Choose a branch...</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name} - {branch.address.street}, {branch.address.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className='bg-blue-50 border border-blue-200 rounded-md p-4 mb-4'>
                <h4 className='font-medium text-blue-900 mb-2'>Course Details:</h4>
                <div className='text-sm text-blue-800 space-y-1'>
                  <p><strong>Duration:</strong> {course?.duration} months</p>
                  <p><strong>Total Fees:</strong> ₹{course?.fees?.toLocaleString()}</p>
                  <p><strong>Level:</strong> {course?.level}</p>
                </div>
              </div>

              <div className='bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4'>
                <p className='text-sm text-yellow-800'>
                  <strong>Note:</strong> After enrollment, please contact the institute for payment details and further instructions.
                </p>
              </div>

              <div className='flex justify-end space-x-3'>
                <button
                  onClick={() => {
                    setShowEnrollModal(false);
                    setSelectedBranch('');
                  }}
                  className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
                  disabled={enrolling}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmEnrollment}
                  disabled={enrolling || !selectedBranch}
                  className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {enrolling ? 'Processing...' : 'Confirm Enrollment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
