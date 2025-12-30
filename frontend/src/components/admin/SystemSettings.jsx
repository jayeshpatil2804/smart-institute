import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    instituteName: 'Smart Institute',
    instituteEmail: 'info@smartinstitute.co.in',
    institutePhone: '+91-96017-49300',
    instituteAddress: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    system: {
      maintenanceMode: false,
      allowRegistrations: true,
      emailNotifications: true,
      smsNotifications: false
    },
    academic: {
      currentSession: '2024-2025',
      maxStudentsPerCourse: 30,
      defaultCourseDuration: 6
    }
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // In a real app, this would fetch from API
      // For now, using default settings
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // In a real app, this would save to API
      console.log('Saving settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'academic', label: 'Academic', icon: '📚' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'social', label: 'Social Media', icon: '📱' },
    { id: 'system', label: 'System', icon: '🖥️' }
  ];

  return (
    <div>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>System Settings</h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50'
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className='bg-white rounded-lg shadow'>
        {/* Tabs */}
        <div className='border-b border-gray-200'>
          <nav className='flex -mb-px'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-6 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className='mr-2'>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className='p-6'>
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>Institute Information</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Institute Name
                    </label>
                    <input
                      type='text'
                      name='instituteName'
                      value={settings.instituteName}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Email
                    </label>
                    <input
                      type='email'
                      name='instituteEmail'
                      value={settings.instituteEmail}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Phone
                    </label>
                    <input
                      type='text'
                      name='institutePhone'
                      value={settings.institutePhone}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>Address</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Street Address
                    </label>
                    <input
                      type='text'
                      name='instituteAddress.street'
                      value={settings.instituteAddress.street}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      City
                    </label>
                    <input
                      type='text'
                      name='instituteAddress.city'
                      value={settings.instituteAddress.city}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      State
                    </label>
                    <input
                      type='text'
                      name='instituteAddress.state'
                      value={settings.instituteAddress.state}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Pincode
                    </label>
                    <input
                      type='text'
                      name='instituteAddress.pincode'
                      value={settings.instituteAddress.pincode}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Academic Settings */}
          {activeTab === 'academic' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>Academic Configuration</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Current Session
                    </label>
                    <input
                      type='text'
                      name='academic.currentSession'
                      value={settings.academic.currentSession}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Max Students per Course
                    </label>
                    <input
                      type='number'
                      name='academic.maxStudentsPerCourse'
                      value={settings.academic.maxStudentsPerCourse}
                      onChange={handleInputChange}
                      min='1'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Default Course Duration (months)
                    </label>
                    <input
                      type='number'
                      name='academic.defaultCourseDuration'
                      value={settings.academic.defaultCourseDuration}
                      onChange={handleInputChange}
                      min='1'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>Notification Preferences</h3>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium text-gray-900'>Email Notifications</h4>
                      <p className='text-sm text-gray-500'>Send email notifications to users</p>
                    </div>
                    <input
                      type='checkbox'
                      name='system.emailNotifications'
                      checked={settings.system.emailNotifications}
                      onChange={handleInputChange}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                  </div>
                  
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium text-gray-900'>SMS Notifications</h4>
                      <p className='text-sm text-gray-500'>Send SMS notifications to users</p>
                    </div>
                    <input
                      type='checkbox'
                      name='system.smsNotifications'
                      checked={settings.system.smsNotifications}
                      onChange={handleInputChange}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Settings */}
          {activeTab === 'social' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>Social Media Links</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Facebook
                    </label>
                    <input
                      type='url'
                      name='socialMedia.facebook'
                      value={settings.socialMedia.facebook}
                      onChange={handleInputChange}
                      placeholder='https://facebook.com/yourpage'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Twitter
                    </label>
                    <input
                      type='url'
                      name='socialMedia.twitter'
                      value={settings.socialMedia.twitter}
                      onChange={handleInputChange}
                      placeholder='https://twitter.com/yourhandle'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Instagram
                    </label>
                    <input
                      type='url'
                      name='socialMedia.instagram'
                      value={settings.socialMedia.instagram}
                      onChange={handleInputChange}
                      placeholder='https://instagram.com/yourhandle'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                  
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      LinkedIn
                    </label>
                    <input
                      type='url'
                      name='socialMedia.linkedin'
                      value={settings.socialMedia.linkedin}
                      onChange={handleInputChange}
                      placeholder='https://linkedin.com/company/yourcompany'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>System Configuration</h3>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium text-gray-900'>Maintenance Mode</h4>
                      <p className='text-sm text-gray-500'>Put the system in maintenance mode</p>
                    </div>
                    <input
                      type='checkbox'
                      name='system.maintenanceMode'
                      checked={settings.system.maintenanceMode}
                      onChange={handleInputChange}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                  </div>
                  
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium text-gray-900'>Allow Registrations</h4>
                      <p className='text-sm text-gray-500'>Allow new user registrations</p>
                    </div>
                    <input
                      type='checkbox'
                      name='system.allowRegistrations'
                      checked={settings.system.allowRegistrations}
                      onChange={handleInputChange}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                  </div>
                </div>
              </div>

              <div className='border-t pt-6'>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>System Actions</h3>
                <div className='space-y-3'>
                  <button className='w-full text-left px-4 py-3 bg-gray-50 rounded hover:bg-gray-100 text-sm font-medium'>
                    🗂️ Clear System Cache
                  </button>
                  <button className='w-full text-left px-4 py-3 bg-gray-50 rounded hover:bg-gray-100 text-sm font-medium'>
                    📊 Generate System Report
                  </button>
                  <button className='w-full text-left px-4 py-3 bg-gray-50 rounded hover:bg-gray-100 text-sm font-medium'>
                    🔄 Rebuild Search Index
                  </button>
                  <button className='w-full text-left px-4 py-3 bg-red-50 rounded hover:bg-red-100 text-sm font-medium text-red-600'>
                    ⚠️ Reset All Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
