import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: 'all',
    user: 'all',
    dateRange: '7days'
  });

  // Mock data for audit logs
  const mockLogs = [
    {
      id: 1,
      user: 'Admin User',
      email: 'admin@smartinstitute.co.in',
      action: 'CREATE_COURSE',
      details: 'Created new course: CERTIFICATE IN ACCOUNTS TRAINING (CAT "SMART")',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'success'
    },
    {
      id: 2,
      user: 'Admin User',
      email: 'admin@smartinstitute.co.in',
      action: 'LOGIN',
      details: 'Admin login successful',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'success'
    },
    {
      id: 3,
      user: 'Test Student',
      email: 'student@smartinstitute.co.in',
      action: 'ENROLL_COURSE',
      details: 'Enrolled in course: CERTIFICATE IN ACCOUNTS TRAINING (CAT)',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      status: 'success'
    },
    {
      id: 4,
      user: 'Admin User',
      email: 'admin@smartinstitute.co.in',
      action: 'UPDATE_USER',
      details: 'Updated user: Test Student',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'success'
    },
    {
      id: 5,
      user: 'Unknown User',
      email: 'unknown@example.com',
      action: 'LOGIN_FAILED',
      details: 'Failed login attempt: Invalid credentials',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      status: 'failed'
    },
    {
      id: 6,
      user: 'Admin User',
      email: 'admin@smartinstitute.co.in',
      action: 'DELETE_BRANCH',
      details: 'Deleted branch: Old Branch',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      status: 'success'
    },
    {
      id: 7,
      user: 'Test Student',
      email: 'student@smartinstitute.co.in',
      action: 'VIEW_COURSE',
      details: 'Viewed course: ADVANCE DIPLOMA IN COMPUTER APPLICATION (A.D.C.A)',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      status: 'success'
    },
    {
      id: 8,
      user: 'Admin User',
      email: 'admin@smartinstitute.co.in',
      action: 'SYSTEM_BACKUP',
      details: 'Manual system backup initiated',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: 'success'
    }
  ];

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from API with filters
      // For now, using mock data with filtering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredLogs = [...mockLogs];
      
      // Filter by action
      if (filters.action !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }
      
      // Filter by date range
      const now = new Date();
      let cutoffDate;
      
      switch (filters.dateRange) {
        case '24hours':
          cutoffDate = new Date(now - 24 * 60 * 60 * 1000);
          break;
        case '7days':
          cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          cutoffDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }
      
      filteredLogs = filteredLogs.filter(log => log.timestamp >= cutoffDate);
      
      setLogs(filteredLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const exportLogs = () => {
    const logData = logs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      user: log.user,
      email: log.email,
      action: log.action,
      details: log.details,
      ipAddress: log.ipAddress,
      status: log.status
    }));

    const dataStr = JSON.stringify(logData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      setLogs([]);
      alert('Audit logs cleared successfully!');
    }
  };

  const getActionColor = (action) => {
    const colors = {
      'LOGIN': 'text-green-600',
      'LOGIN_FAILED': 'text-red-600',
      'CREATE_COURSE': 'text-blue-600',
      'UPDATE_COURSE': 'text-yellow-600',
      'DELETE_COURSE': 'text-red-600',
      'ENROLL_COURSE': 'text-purple-600',
      'UPDATE_USER': 'text-yellow-600',
      'DELETE_USER': 'text-red-600',
      'CREATE_BRANCH': 'text-blue-600',
      'UPDATE_BRANCH': 'text-yellow-600',
      'DELETE_BRANCH': 'text-red-600',
      'VIEW_COURSE': 'text-gray-600',
      'SYSTEM_BACKUP': 'text-indigo-600'
    };
    return colors[action] || 'text-gray-600';
  };

  const getStatusIcon = (status) => {
    return status === 'success' ? '✅' : '❌';
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const uniqueActions = [...new Set(mockLogs.map(log => log.action))];

  return (
    <div>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>Audit Logs</h2>
        <div className='flex space-x-3'>
          <button
            onClick={exportLogs}
            className='bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors'
          >
            Export Logs
          </button>
          <button
            onClick={clearLogs}
            className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors'
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow p-4 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Action Filter
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='24hours'>Last 24 Hours</option>
              <option value='7days'>Last 7 Days</option>
              <option value='30days'>Last 30 Days</option>
              <option value='all'>All Time</option>
            </select>
          </div>
          
          <div className='flex items-end'>
            <div className='text-sm text-gray-600'>
              Showing <span className='font-medium'>{logs.length}</span> logs
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Timestamp
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  User
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Action
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Details
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  IP Address
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {logs.map((log) => (
                <tr key={log.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    <div>
                      <div>{log.timestamp.toLocaleDateString()}</div>
                      <div>{log.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    <div>
                      <div className='font-medium'>{log.user}</div>
                      <div className='text-gray-500'>{log.email}</div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <span className={`font-medium ${getActionColor(log.action)}`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-500 max-w-xs truncate'>
                    {log.details}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {log.ipAddress}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm'>
                    <span className='flex items-center'>
                      {getStatusIcon(log.status)}
                      <span className='ml-1 capitalize'>{log.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {logs.length === 0 && (
          <div className='text-center py-12'>
            <div className='text-gray-500 text-lg'>
              No audit logs found for the selected filters
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className='mt-6 grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white rounded-lg shadow p-4'>
          <h4 className='text-sm font-medium text-gray-700 mb-1'>Total Logs</h4>
          <p className='text-2xl font-bold text-blue-600'>{logs.length}</p>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <h4 className='text-sm font-medium text-gray-700 mb-1'>Successful</h4>
          <p className='text-2xl font-bold text-green-600'>
            {logs.filter(log => log.status === 'success').length}
          </p>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <h4 className='text-sm font-medium text-gray-700 mb-1'>Failed</h4>
          <p className='text-2xl font-bold text-red-600'>
            {logs.filter(log => log.status === 'failed').length}
          </p>
        </div>
        <div className='bg-white rounded-lg shadow p-4'>
          <h4 className='text-sm font-medium text-gray-700 mb-1'>Unique Users</h4>
          <p className='text-2xl font-bold text-purple-600'>
            {[...new Set(logs.map(log => log.email))].length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
