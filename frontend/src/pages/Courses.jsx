import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, searchTerm, selectedLevel]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (selectedLevel !== 'All') params.append('level', selectedLevel);

      const response = await axios.get(`http://localhost:5000/api/courses?${params}`);
      setCourses(response.data.courses || response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'All',
    'Accounting',
    'Designing', 
    '10+2/ College Students',
    'IT For Beginners',
    'Diploma',
    'Global IT Certifications'
  ];

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const handleCourseClick = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleEnrollNow = async (e, course) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${course._id}`, enroll: true } });
      return;
    }

    if (user.role !== 'Student') {
      alert('Only students can enroll in courses!');
      return;
    }

    setEnrolling(course._id);
    
    try {
      // Get main branch or first available branch
      const branchesResponse = await axios.get('http://localhost:5000/api/branches');
      const branches = branchesResponse.data;
      const mainBranch = branches.find(b => b.name === 'Main Branch') || branches[0];
      
      if (!mainBranch) {
        alert('No branches available. Please contact admin.');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/enrollments/self-enroll', {
        course: course._id,
        branch: mainBranch._id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.requiresAdmission) {
        // Redirect to admission form with enrollment data
        navigate('/admission-form', { 
          state: { 
            enrollment: response.data.enrollment,
            course: course,
            branch: mainBranch
          } 
        });
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      if (error.response?.status === 400 && error.response?.data?.enrollmentStatus) {
        // Already enrolled, check if admission is needed
        if (error.response.data.enrollmentStatus === 'ENROLLED_NOT_ADMITTED') {
          navigate('/admission-form');
        } else {
          alert('You are already admitted to this course!');
        }
      } else {
        alert(error.response?.data?.message || 'Enrollment failed. Please try again.');
      }
    } finally {
      setEnrolling(null);
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
        {/* Hero Section */}
        <div className='bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16'>
          <div className='container mx-auto px-4 text-center'>
            <h1 className='text-4xl md:text-5xl font-bold mb-4'>
              Our Courses
            </h1>
            <p className='text-xl text-blue-100 max-w-3xl mx-auto mb-8'>
              Discover our comprehensive range of courses designed to enhance your skills and advance your career
            </p>
            
            {/* Search Bar */}
            <div className='max-w-2xl mx-auto'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search courses by name, code, or description...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full px-6 py-4 pr-12 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400'
                />
                <svg
                  className='absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className='bg-white border-b sticky top-0 z-10 shadow-sm'>
          <div className='container mx-auto px-4 py-6'>
            <div className='flex flex-col lg:flex-row gap-6 items-center justify-between'>
              {/* Category Filter */}
              <div className='flex-1'>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>Categories</h3>
                <div className='flex flex-wrap gap-2'>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>Level</h3>
                <div className='flex gap-2'>
                  {levels.map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedLevel === level
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <p className='text-gray-600'>
              Showing <span className='font-medium'>{courses.length}</span> courses
            </p>
            <div className='flex gap-2'>
              <button className='px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50'>
                <svg className='w-4 h-4 inline mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                </svg>
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className='container mx-auto px-4 pb-16'>
          {courses.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {courses.map(course => (
                <div 
                  key={course._id} 
                  className='bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group'
                  onClick={() => handleCourseClick(course._id)}
                >
                  {/* Course Image */}
                  <div className='relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden'>
                    {course.image && course.image.startsWith('http') ? (
                      <img 
                        src={course.image} 
                        alt={course.title} 
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><svg class="w-16 h-16 text-blue-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg></div>';
                        }}
                      />
                    ) : (
                      <div className='flex items-center justify-center h-full'>
                        <svg className='w-16 h-16 text-blue-300' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z' clipRule='evenodd' />
                        </svg>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className='absolute top-3 right-3'>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (course.status || 'Active') === 'Featured' ? 'bg-yellow-100 text-yellow-800' :
                        (course.status || 'Active') === 'Upcoming' ? 'bg-gray-100 text-gray-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {course.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className='p-5'>
                    {/* Category and Level */}
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-xs font-medium text-blue-600 uppercase tracking-wide'>
                        {course.category || 'General'}
                      </span>
                      <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded'>
                        {course.level || 'Beginner'}
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 className='text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors'>
                      {course.title || 'Untitled Course'}
                    </h3>

                    {/* Short Description */}
                    <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                      {course.shortDescription || 'No description available'}
                    </p>
                    
                    {/* Course Details */}
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center text-gray-500'>
                        <svg className='w-4 h-4 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd'/>
                        </svg>
                        <span className='text-sm'>{course.duration || 0} months</span>
                      </div>
                      <div className='text-lg font-bold text-blue-600'>
                        ₹{course.fees ? Number(course.fees).toLocaleString() : '0'}
                      </div>
                    </div>

                    {/* Course Code */}
                    <div className='flex items-center justify-between mb-4'>
                      <span className='text-xs text-gray-500'>Course Code: {course.code || 'N/A'}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-2'>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseClick(course._id);
                        }}
                        className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium'
                      >
                        View Details
                      </button>
                      {isAuthenticated && user.role === 'Student' && (
                        <button 
                          onClick={(e) => handleEnrollNow(e, course)}
                          disabled={enrolling === course._id}
                          className='flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed'
                        >
                          {enrolling === course._id ? (
                            <span className='flex items-center justify-center'>
                              <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                              </svg>
                              Enrolling...
                            </span>
                          ) : (
                            'Enroll Now'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-16'>
              <svg className='w-24 h-24 text-gray-300 mx-auto mb-4' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z' clipRule='evenodd' />
              </svg>
              <h3 className='text-xl font-medium text-gray-900 mb-2'>No courses found</h3>
              <p className='text-gray-500 mb-6'>
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedLevel('All');
                  setSearchTerm('');
                }}
                className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors'
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
  );
};

export default Courses;