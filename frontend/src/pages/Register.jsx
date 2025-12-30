import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
    designation: '',
    branch: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    dateOfBirth: '',
    gender: '',
    qualification: '',
    experience: ''
  });
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/branches');
      setBranches(response.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getDesignationOptions = () => {
    // Only student designation is available for public registration
    if (formData.role === 'Student') {
      return ['Student'];
    }
    return [];
  };

  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center mb-8'>
          <h2 className='text-3xl font-extrabold text-gray-900'>
            Create your account
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Or{' '}
            <Link
              to='/login'
              className='font-medium text-blue-600 hover:text-blue-500'
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className='bg-white shadow-lg rounded-lg p-8' onSubmit={onSubmit}>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6'>
              {error}
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Personal Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-gray-900 border-b pb-2'>
                Personal Information
              </h3>
              
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  First Name
                </label>
                <input
                  type='text'
                  name='firstName'
                  required
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.firstName}
                  onChange={onChange}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Last Name
                </label>
                <input
                  type='text'
                  name='lastName'
                  required
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.lastName}
                  onChange={onChange}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Email
                </label>
                <input
                  type='email'
                  name='email'
                  required
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.email}
                  onChange={onChange}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Phone
                </label>
                <input
                  type='tel'
                  name='phone'
                  required
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.phone}
                  onChange={onChange}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Date of Birth
                </label>
                <input
                  type='date'
                  name='dateOfBirth'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.dateOfBirth}
                  onChange={onChange}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Gender
                </label>
                <select
                  name='gender'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.gender}
                  onChange={onChange}
                >
                  <option value=''>Select Gender</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                </select>
              </div>
            </div>

            {/* Professional Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-medium text-gray-900 border-b pb-2'>
                Professional Information
              </h3>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Role
                </label>
                <select
                  name='role'
                  required
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-100'
                  value={formData.role}
                  onChange={onChange}
                  disabled
                >
                  <option value='Student'>Student</option>
                </select>
                <p className='mt-1 text-sm text-gray-500'>
                  Only student registration is available through this form
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Designation
                </label>
                <select
                  name='designation'
                  required
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.designation}
                  onChange={onChange}
                >
                  <option value=''>Select Designation</option>
                  {getDesignationOptions().map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Branch
                </label>
                <select
                  name='branch'
                  required
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.branch}
                  onChange={onChange}
                >
                  <option value=''>Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name} ({branch.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Qualification
                </label>
                <input
                  type='text'
                  name='qualification'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.qualification}
                  onChange={onChange}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Experience
                </label>
                <input
                  type='text'
                  name='experience'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.experience}
                  onChange={onChange}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className='mt-8 space-y-4'>
            <h3 className='text-lg font-medium text-gray-900 border-b pb-2'>
              Address Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Street Address
                </label>
                <input
                  type='text'
                  name='address.street'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.address.street}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  City
                </label>
                <input
                  type='text'
                  name='address.city'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.address.city}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  State
                </label>
                <input
                  type='text'
                  name='address.state'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.address.state}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Pincode
                </label>
                <input
                  type='text'
                  name='address.pincode'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.address.pincode}
                  onChange={onChange}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className='mt-8 space-y-4'>
            <h3 className='text-lg font-medium text-gray-900 border-b pb-2'>
              Password
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Password
                </label>
                <input
                  type='password'
                  name='password'
                  required
                  minLength='6'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.password}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Confirm Password
                </label>
                <input
                  type='password'
                  name='confirmPassword'
                  required
                  minLength='6'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                  value={formData.confirmPassword}
                  onChange={onChange}
                />
              </div>
            </div>
          </div>

          <div className='mt-8'>
            <button
              type='submit'
              disabled={loading}
              className='w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;