import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [balRes, leaveRes] = await Promise.all([
        api.get('/balances/my-balances'),
        api.get('/leaves/my-leaves'),
      ]);
      setBalances(balRes.data);
      setRecentLeaves(leaveRes.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to load employee dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Employee Dashboard" />
        <main className="page-body">
          {/* Welcome Banner */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
                Welcome back, {user?.firstName}! 👋
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                Employee ID: <strong>{user?.employeeId}</strong> | Department: <strong>{user?.department}</strong>
              </p>
            </div>
            <Link to="/apply-leave" className="btn btn-primary">
              + Apply for Leave
            </Link>
          </div>

          {/* Quick Balance Cards */}
          <h3 className="card-title">Available Leave Balances ({new Date().getFullYear()})</h3>
          <div className="grid-4">
            {balances.map((b) => (
              <div key={b.id} className="stat-card">
                <span className="stat-title">{b.leaveTypeName}</span>
                <span className="stat-value">{b.remainingDays} <span style={{ fontSize: '1rem', fontWeight: 400, color: '#94a3b8' }}>days</span></span>
                <span className="stat-subtext">Used: {b.usedDays} of {b.totalDays} days</span>
              </div>
            ))}
          </div>

          {/* Recent Leave Requests Table */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-title" style={{ margin: 0 }}>Recent Leave Applications</h3>
              <Link to="/leave-history" className="btn btn-secondary btn-sm">
                View All History
              </Link>
            </div>

            {loading ? (
              <p style={{ color: '#64748b' }}>Loading leave requests...</p>
            ) : recentLeaves.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                No leave applications found. Click <strong>Apply for Leave</strong> to submit a request.
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Manager Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeaves.map((req) => (
                      <tr key={req.id}>
                        <td><strong>{req.leaveTypeName}</strong></td>
                        <td>{req.startDate} to {req.endDate}</td>
                        <td>{req.totalDays}</td>
                        <td style={{ maxWidth: 260, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {req.reason}
                        </td>
                        <td><StatusBadge status={req.status} /></td>
                        <td style={{ color: '#64748b' }}>
                          {req.managerComment || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
