import React from 'react';

const About = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
        {/* Hero Section */}
        <div className='bg-blue-900 text-white py-20'>
          <div className='container mx-auto px-4 text-center'>
            <h1 className='text-4xl md:text-5xl font-bold mb-4'>
              About Smart Institute
            </h1>
            <p className='text-xl text-blue-100 max-w-3xl mx-auto'>
              Empowering students with quality education and professional training since 2010
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className='py-16'>
          <div className='container mx-auto px-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
              <div>
                <h2 className='text-3xl font-bold text-gray-900 mb-6'>Our Story</h2>
                <p className='text-gray-600 mb-4'>
                  Smart Institute was founded with a vision to provide quality education and professional training to students from all walks of life. Over the years, we have grown into a premier educational institution with multiple branches across the country.
                </p>
                <p className='text-gray-600 mb-4'>
                  Our commitment to excellence has helped us build a reputation for delivering high-quality education that meets industry standards and prepares students for successful careers.
                </p>
                <p className='text-gray-600'>
                  Today, we offer a wide range of courses in computer education, professional development, and vocational training, serving thousands of students every year.
                </p>
              </div>
              <div className='relative overflow-hidden rounded-lg h-96'>
                <img 
                  src='https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop&crop=center&auto=format'
                  alt='Smart Institute Education Environment' 
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    e.target.src = 'https://dummyimage.com/800x400/2563eb/ffffff&text=Smart+Institute';
                  }}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent'></div>
                <div className='absolute bottom-6 left-6 text-white'>
                  <h3 className='text-2xl font-bold mb-2'>SMART INSTITUTE</h3>
                  <p className='text-blue-100'>Quality Education Since 2010</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div id='mission' className='py-16 bg-white'>
          <div className='container mx-auto px-4'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>Mission & Vision</h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div className='text-center p-8 bg-blue-50 rounded-lg'>
                <div className='w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z'/>
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>Our Mission</h3>
                <p className='text-gray-600'>
                  To provide accessible, affordable, and high-quality education that empowers students to achieve their career goals and contribute to society.
                </p>
              </div>
              <div className='text-center p-8 bg-green-50 rounded-lg'>
                <div className='w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M10 12a2 2 0 100-4 2 2 0 000 4z'/>
                    <path fillRule='evenodd' d='M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z' clipRule='evenodd'/>
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-4'>Our Vision</h3>
                <p className='text-gray-600'>
                  To be a leading educational institution recognized for excellence in teaching, innovation, and student success across all our programs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className='py-16 bg-gray-50'>
          <div className='container mx-auto px-4'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>Our Values</h2>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z' clipRule='evenodd'/>
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>Excellence</h3>
                <p className='text-gray-600'>
                  We strive for excellence in everything we do, from teaching methods to student support.
                </p>
              </div>
              <div className='text-center'>
                <div className='w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z'/>
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>Integrity</h3>
                <p className='text-gray-600'>
                  We operate with honesty, transparency, and ethical principles in all our dealings.
                </p>
              </div>
              <div className='text-center'>
                <div className='w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8 text-white' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' clipRule='evenodd'/>
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>Innovation</h3>
                <p className='text-gray-600'>
                  We embrace new ideas and technologies to enhance the learning experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div id='team' className='py-16 bg-white'>
          <div className='container mx-auto px-4'>
            <div className='text-center mb-12'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>Our Leadership Team</h2>
              <p className='text-gray-600 max-w-2xl mx-auto'>
                Meet the dedicated professionals who lead Smart Institute with passion and expertise
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div className='text-center'>
                <div className='w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4'></div>
                <h3 className='text-xl font-bold text-gray-900'>Dr. Rajesh Kumar</h3>
                <p className='text-gray-600 mb-2'>Director & Founder</p>
                <p className='text-sm text-gray-500'>
                  20+ years of experience in education management
                </p>
              </div>
              <div className='text-center'>
                <div className='w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4'></div>
                <h3 className='text-xl font-bold text-gray-900'>Mrs. Priya Sharma</h3>
                <p className='text-gray-600 mb-2'>Academic Director</p>
                <p className='text-sm text-gray-500'>
                  Expert in curriculum development and quality assurance
                </p>
              </div>
              <div className='text-center'>
                <div className='w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4'></div>
                <h3 className='text-xl font-bold text-gray-900'>Mr. Amit Singh</h3>
                <p className='text-gray-600 mb-2'>Operations Head</p>
                <p className='text-sm text-gray-500'>
                  Specialized in institutional administration
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default About;