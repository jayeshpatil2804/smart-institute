import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import MasterTable from '../../components/master/MasterTable';
import axios from 'axios';

const UserRights = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingRights, setEditingRights] = useState(null);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [formData, setFormData] = useState({
    user: '',
    userName: '',
    userEmail: '',
    userRole: '',
    branch: '',
    branchName: '',
    permissions: {
      students: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
      employees: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
      subjects: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
      materials: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
      exams: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
      results: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
      news: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
      complaints: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
      feedback: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
      userRights: { view: false, create: false, edit: false, delete: false, ownBranchOnly: false }
    },
    isActive: true,
    effectiveFrom: new Date().toISOString().split('T')[0],
    validUntil: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/master/user-rights/available-users/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
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

  const handleAdd = () => {
    setEditingRights(null);
    setFormData({
      user: '',
      userName: '',
      userEmail: '',
      userRole: '',
      branch: '',
      branchName: '',
      permissions: {
        students: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
        employees: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
        subjects: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
        materials: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
        exams: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
        results: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
        news: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
        complaints: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
        feedback: { view: false, create: false, edit: false, delete: false, ownBranchOnly: true },
        userRights: { view: false, create: false, edit: false, delete: false, ownBranchOnly: false }
      },
      isActive: true,
      effectiveFrom: new Date().toISOString().split('T')[0],
      validUntil: ''
    });
    setShowModal(true);
  };

  const handleEdit = (rights) => {
    setEditingRights(rights);
    setFormData({
      user: rights.user._id || rights.user,
      userName: rights.userName,
      userEmail: rights.userEmail,
      userRole: rights.userRole,
      branch: rights.branch._id || rights.branch,
      branchName: rights.branchName,
      permissions: rights.permissions,
      isActive: rights.isActive,
      effectiveFrom: rights.effectiveFrom ? new Date(rights.effectiveFrom).toISOString().split('T')[0] : '',
      validUntil: rights.validUntil ? new Date(rights.validUntil).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleView = (rights) => {
    console.log('View user rights:', rights);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const submitData = {
        ...formData,
        user: formData.user,
        branch: formData.branch
      };

      if (editingRights) {
        await axios.put(
          `http://localhost:5000/api/master/user-rights/${editingRights._id}`,
          submitData,
          config
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/master/user-rights',
          submitData,
          config
        );
      }

      setShowModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error saving user rights:', error);
      alert(error.response?.data?.message || 'Failed to save user rights');
    }
  };

  const handleUserChange = (userId) => {
    const selectedUser = users.find(u => u._id === userId);
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        user: userId,
        userName: `${selectedUser.firstName} ${selectedUser.lastName}`,
        userEmail: selectedUser.email,
        userRole: selectedUser.role
      }));
    }
  };

  const handleBranchChange = (branchId) => {
    const selectedBranch = branches.find(b => b._id === branchId);
    if (selectedBranch) {
      setFormData(prev => ({
        ...prev,
        branch: branchId,
        branchName: selectedBranch.name
      }));
    }
  };

  const handlePermissionChange = (module, action, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: value
        }
      }
    }));
  };

  const columns = [
    { 
      key: 'userName', 
      label: 'User Name',
      render: (item) => item.user?.firstName && item.user?.lastName 
        ? `${item.user.firstName} ${item.user.lastName}` 
        : item.userName 
    },
    { key: 'userEmail', label: 'Email' },
    { key: 'userRole', label: 'Role' },
    { 
      key: 'branchName', 
      label: 'Branch',
      render: (item) => item.branch?.name || item.branchName || '-'
    },
    { 
      key: 'isActive', 
      label: 'Status',
      type: 'boolean'
    },
    { 
      key: 'effectiveFrom', 
      label: 'Effective From',
      type: 'date'
    }
  ];

  const filters = [
    {
      key: 'userRole',
      placeholder: 'Filter by Role',
      options: [
        { value: 'Admin', label: 'Admin' },
        { value: 'Branch Admin', label: 'Branch Admin' },
        { value: 'Faculty', label: 'Faculty' },
        { value: 'Staff', label: 'Staff' }
      ]
    },
    {
      key: 'branch',
      placeholder: 'Filter by Branch',
      options: branches.map(branch => ({
        value: branch._id,
        label: branch.name
      }))
    },
    {
      key: 'isActive',
      placeholder: 'Filter by Status',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    }
  ];

  const modules = [
    { key: 'students', label: 'Students' },
    { key: 'employees', label: 'Employees' },
    { key: 'subjects', label: 'Subjects' },
    { key: 'materials', label: 'Materials' },
    { key: 'exams', label: 'Exams' },
    { key: 'results', label: 'Results' },
    { key: 'news', label: 'News' },
    { key: 'complaints', label: 'Complaints' },
    { key: 'feedback', label: 'Feedback' },
    { key: 'userRights', label: 'User Rights' }
  ];

  const actions = ['view', 'create', 'edit', 'delete'];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Rights Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage user permissions and access rights for Master modules
        </p>
      </div>

      <MasterTable
        title="User Rights"
        apiEndpoint="master/user-rights"
        columns={columns}
        filters={filters}
        searchPlaceholder="Search by user name or email..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        refreshTrigger={refreshTrigger}
      />

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingRights ? 'Edit User Rights' : 'Add User Rights'}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User Information */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900 border-b pb-2">User Information</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">User *</label>
                        <select
                          value={formData.user}
                          onChange={(e) => handleUserChange(e.target.value)}
                          required
                          disabled={!!editingRights}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">Select User</option>
                          {users.map(user => (
                            <option key={user._id} value={user._id}>
                              {user.firstName} {user.lastName} ({user.email}) - {user.role}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Branch *</label>
                        <select
                          value={formData.branch}
                          onChange={(e) => handleBranchChange(e.target.value)}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Branch</option>
                          {branches.map(branch => (
                            <option key={branch._id} value={branch._id}>{branch.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          value={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Effective From</label>
                        <input
                          type="date"
                          value={formData.effectiveFrom}
                          onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Valid Until (Optional)</label>
                        <input
                          type="date"
                          value={formData.validUntil}
                          onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900 border-b pb-2">Module Permissions</h4>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Module
                              </th>
                              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                View
                              </th>
                              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Create
                              </th>
                              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Edit
                              </th>
                              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Delete
                              </th>
                              <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Own Branch Only
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {modules.map((module) => (
                              <tr key={module.key}>
                                <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {module.label}
                                </td>
                                {actions.map((action) => (
                                  <td key={action} className="px-2 py-2 whitespace-nowrap text-center">
                                    <input
                                      type="checkbox"
                                      checked={formData.permissions[module.key][action]}
                                      onChange={(e) => handlePermissionChange(module.key, action, e.target.checked)}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                  </td>
                                ))}
                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                  <input
                                    type="checkbox"
                                    checked={formData.permissions[module.key].ownBranchOnly}
                                    onChange={(e) => handlePermissionChange(module.key, 'ownBranchOnly', e.target.checked)}
                                    disabled={module.key === 'userRights'}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingRights ? 'Update' : 'Create'} User Rights
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRights;
