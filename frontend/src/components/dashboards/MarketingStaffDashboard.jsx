import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const MarketingStaffDashboard = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    convertedLeads: 0,
    pendingFollowUps: 0,
    newLeads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeadsData();
  }, []);

  const fetchLeadsData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/leads');
      const allLeads = response.data;
      const myLeads = allLeads.filter(lead => lead.assignedTo?._id === user._id);
      
      setLeads(myLeads);
      setStats({
        totalLeads: myLeads.length,
        convertedLeads: myLeads.filter(l => l.status === 'Converted').length,
        pendingFollowUps: myLeads.filter(l => l.nextFollowUpDate && new Date(l.nextFollowUpDate) <= new Date()).length,
        newLeads: myLeads.filter(l => l.status === 'New').length
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
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
            Marketing Staff Dashboard
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
                  <path d='M9 2a1 1 0 000 2h2a1 1 0 100-2H9z'/>
                  <path fillRule='evenodd' d='M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100-4h-.5a1 1 0 000-2H8a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V5z' clipRule='evenodd'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Total Leads</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.totalLeads}</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-green-100 rounded-full'>
                <svg className='w-6 h-6 text-green-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Converted</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.convertedLeads}</p>
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
                <p className='text-sm font-medium text-gray-600'>Pending Follow-ups</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.pendingFollowUps}</p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='p-3 bg-purple-100 rounded-full'>
                <svg className='w-6 h-6 text-purple-600' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd'/>
                </svg>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>New Leads</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.newLeads}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Lead Management</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Add New Lead</h3>
              <p className='text-gray-600 text-sm'>Create a new lead entry</p>
            </button>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Lead Generation</h3>
              <p className='text-gray-600 text-sm'>Generate new leads</p>
            </button>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Follow-ups</h3>
              <p className='text-gray-600 text-sm'>Manage follow-up schedule</p>
            </button>
            <button className='bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow'>
              <h3 className='font-semibold text-gray-900 mb-2'>Student References</h3>
              <p className='text-gray-600 text-sm'>Track student referrals</p>
            </button>
          </div>
        </div>

        {/* Recent Leads */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Recent Leads</h2>
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            {leads.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Name
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Contact
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Priority
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Next Follow-up
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {leads.slice(0, 5).map(lead => (
                      <tr key={lead._id}>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>
                            {lead.firstName} {lead.lastName}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          <div>{lead.phone}</div>
                          <div className='text-xs'>{lead.email}</div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                            {lead.status}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                            {lead.priority}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {lead.nextFollowUpDate ? 
                            new Date(lead.nextFollowUpDate).toLocaleDateString() : 
                            'Not scheduled'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='p-6 text-center text-gray-500'>
                No leads assigned yet
              </div>
            )}
          </div>
        </div>

        {/* Lead Conversion Chart */}
        <div className='mt-8'>
          <h2 className='text-xl font-bold text-gray-900 mb-4'>Lead Conversion Overview</h2>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 text-center'>
              <div>
                <div className='text-2xl font-bold text-blue-600'>{stats.totalLeads}</div>
                <div className='text-sm text-gray-600'>Total Leads</div>
              </div>
              <div>
                <div className='text-2xl font-bold text-green-600'>{stats.convertedLeads}</div>
                <div className='text-sm text-gray-600'>Converted</div>
              </div>
              <div>
                <div className='text-2xl font-bold text-yellow-600'>{stats.newLeads}</div>
                <div className='text-sm text-gray-600'>New</div>
              </div>
              <div>
                <div className='text-2xl font-bold text-purple-600'>
                  {stats.totalLeads > 0 ? Math.round((stats.convertedLeads / stats.totalLeads) * 100) : 0}%
                </div>
                <div className='text-sm text-gray-600'>Conversion Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingStaffDashboard;