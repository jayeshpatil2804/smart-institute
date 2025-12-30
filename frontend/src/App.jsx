import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AdmissionForm from './pages/AdmissionForm';
import Payment from './pages/Payment';
import ProtectedRoute from './components/ProtectedRoute';
import Students from './pages/master/Students';
import UserRights from './pages/master/UserRights';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes - Accessible to everyone */}
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/about" element={<><Navbar /><About /></>} />
            <Route path="/courses" element={<><Navbar /><Courses /></>} />
            <Route path="/courses/:id" element={<><Navbar /><CourseDetail /></>} />
            <Route path="/gallery" element={<><Navbar /><Gallery /></>} />
            <Route path="/contact" element={<><Navbar /><Contact /></>} />
            <Route path="/admission" element={<><Navbar /><AdmissionForm /></>} />
            <Route path="/admission-form" element={<><Navbar /><AdmissionForm /></>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes - Require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            } />
            
            {/* Master Module Routes - Admin and Branch Admin only */}
            <Route path="/admin/master/students" element={
              <ProtectedRoute>
                <Students />
              </ProtectedRoute>
            } />
            <Route path="/admin/master/user-rights" element={
              <ProtectedRoute>
                <UserRights />
              </ProtectedRoute>
            } />
            
            {/* Fallback route */}
            <Route path="*" element={<><Navbar /><Home /></>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
