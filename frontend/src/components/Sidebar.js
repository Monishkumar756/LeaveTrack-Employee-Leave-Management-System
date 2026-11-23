import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, isAdmin, isManager } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">LT</div>
        <div className="sidebar-logo-text">LeaveTrack</div>
      </div>

      <nav className="sidebar-nav">
        {/* Employee Section */}
        <div className="nav-section-title">My Leave</div>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>📊</span> Dashboard
        </NavLink>
        <NavLink to="/apply-leave" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>✍️</span> Apply Leave
        </NavLink>
        <NavLink to="/leave-history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>📅</span> Leave History
        </NavLink>
        <NavLink to="/leave-balance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span>💼</span> Leave Balances
        </NavLink>

        {/* Manager Section */}
        {isManager() && (
          <>
            <div className="nav-section-title">Manager Workspace</div>
            <NavLink to="/manager/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span>📈</span> Team Overview
            </NavLink>
            <NavLink to="/manager/approvals" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span>✅</span> Leave Approvals
            </NavLink>
          </>
        )}

        {/* Admin Section */}
        {isAdmin() && (
          <>
            <div className="nav-section-title">Administration</div>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span>⚙️</span> Admin Overview
            </NavLink>
            <NavLink to="/admin/employees" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span>👥</span> Employee Directory
            </NavLink>
            <NavLink to="/admin/leave-types" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span>📋</span> Leave Types
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span>📑</span> Reports & Analytics
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-snippet-name">{user?.firstName} {user?.lastName}</div>
        <div className="user-snippet-role">{user?.department}</div>
      </div>
    </aside>
  );
};

export default Sidebar;
