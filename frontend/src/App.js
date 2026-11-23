import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ApplyLeavePage from './pages/ApplyLeavePage';
import LeaveHistoryPage from './pages/LeaveHistoryPage';
import LeaveBalancePage from './pages/LeaveBalancePage';
import ManagerDashboard from './pages/ManagerDashboard';
import LeaveApprovalPage from './pages/LeaveApprovalPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeManagementPage from './pages/EmployeeManagementPage';
import LeaveTypeManagementPage from './pages/LeaveTypeManagementPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Employee Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_ADMIN']} />}>
            <Route path="/dashboard" element={<EmployeeDashboard />} />
            <Route path="/apply-leave" element={<ApplyLeavePage />} />
            <Route path="/leave-history" element={<LeaveHistoryPage />} />
            <Route path="/leave-balance" element={<LeaveBalancePage />} />
          </Route>

          {/* Manager Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_MANAGER', 'ROLE_ADMIN']} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/approvals" element={<LeaveApprovalPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/employees" element={<EmployeeManagementPage />} />
            <Route path="/admin/leave-types" element={<LeaveTypeManagementPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
