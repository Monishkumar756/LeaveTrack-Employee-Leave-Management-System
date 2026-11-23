import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'ROLE_MANAGER') {
        navigate('/manager/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="sidebar-logo-icon" style={{ margin: '0 auto 0.75rem', width: 44, height: 44, fontSize: '1.4rem' }}>
            LT
          </div>
          <h1>LeaveTrack</h1>
          <p>Sign in to your employee portal</p>
        </div>

        {isExpired && (
          <div className="alert alert-danger">
            Your session has expired. Please sign in again.
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </div>

        <div className="demo-credentials-box">
          <strong style={{ color: '#0f172a' }}>Quick Demo Logins (Click to Fill):</strong>
          <div className="demo-btn-group">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('admin@leavetrack.com', 'password123')}
            >
              Admin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('manager@leavetrack.com', 'password123')}
            >
              Manager
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('alex@leavetrack.com', 'password123')}
            >
              Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
