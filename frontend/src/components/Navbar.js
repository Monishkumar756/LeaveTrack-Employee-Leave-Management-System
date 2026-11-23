import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Admin';
      case 'ROLE_MANAGER': return 'Manager';
      case 'ROLE_EMPLOYEE': return 'Employee';
      default: return role;
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-title">{title || 'Dashboard'}</div>
      <div className="topbar-right">
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {user?.firstName} {user?.lastName}
          </div>
          <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.1rem 0.5rem', fontSize: '0.7rem' }}>
            {getRoleBadge(user?.role)}
          </span>
        </div>
        <button onClick={logout} className="btn btn-secondary btn-sm" title="Sign out">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
