import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import BranchAdminDashboard from '../components/dashboards/BranchAdminDashboard';
import StudentDashboard from '../components/dashboards/StudentDashboard';
import MarketingStaffDashboard from '../components/dashboards/MarketingStaffDashboard';
import AccountantDashboard from '../components/dashboards/AccountantDashboard';
import ReceptionDashboard from '../components/dashboards/ReceptionDashboard';
import TeacherDashboard from '../components/dashboards/TeacherDashboard';
import StockAdminDashboard from '../components/dashboards/StockAdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Branch Admin':
        return <BranchAdminDashboard />;
      case 'Student':
        return <StudentDashboard />;
      case 'Marketing Staff':
        return <MarketingStaffDashboard />;
      case 'Accountant':
        return <AccountantDashboard />;
      case 'Reception':
        return <ReceptionDashboard />;
      case 'Teacher':
        return <TeacherDashboard />;
      case 'Stock Admin':
        return <StockAdminDashboard />;
      default:
        return (
          <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
            <div className='text-center'>
              <h1 className='text-2xl font-bold text-gray-900 mb-4'>
                Dashboard Not Available
              </h1>
              <p className='text-gray-600'>
                Your role ({user?.role}) does not have a configured dashboard.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;