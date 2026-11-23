import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/reports/dashboard');
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load admin summary', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Administrator Portal" />
        <main className="page-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
                System Administration Dashboard
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Enterprise overview of all company employees, leave policies, and organizational requests
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/admin/employees" className="btn btn-secondary">
                Manage Employees
              </Link>
              <Link to="/reports" className="btn btn-primary">
                View Reports
              </Link>
            </div>
          </div>

          {/* System KPIs */}
          <div className="grid-4">
            <div className="stat-card">
              <span className="stat-title">Total Employees</span>
              <span className="stat-value">{summary?.totalEmployees ?? '—'}</span>
              <span className="stat-subtext">Active corporate staff</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #d97706' }}>
              <span className="stat-title">Pending Approvals</span>
              <span className="stat-value">{summary?.pendingRequests ?? '—'}</span>
              <span className="stat-subtext">Awaiting manager action</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
              <span className="stat-title">Approved Leaves</span>
              <span className="stat-value">{summary?.approvedRequests ?? '—'}</span>
              <span className="stat-subtext">Granted for this year</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #dc2626' }}>
              <span className="stat-title">Rejected Requests</span>
              <span className="stat-value">{summary?.rejectedRequests ?? '—'}</span>
              <span className="stat-subtext">Declined applications</span>
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="card" style={{ marginBottom: 0 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Employee Management</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 1rem' }}>
                Add new hires, update department allocations, reset accounts, or assign managers.
              </p>
              <Link to="/admin/employees" className="btn btn-secondary btn-sm">
                Open Directory →
              </Link>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Leave Policy Configuration</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 1rem' }}>
                Configure sick, casual, paid, or parental leave policies, quotas, and carry-over rules.
              </p>
              <Link to="/admin/leave-types" className="btn btn-secondary btn-sm">
                Manage Leave Types →
              </Link>
            </div>

            <div className="card" style={{ marginBottom: 0 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Audit & Analytics Reports</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 1rem' }}>
                Generate monthly and annual utilization breakdown reports for executive review.
              </p>
              <Link to="/reports" className="btn btn-secondary btn-sm">
                Open Reports →
              </Link>
            </div>
          </div>

          {/* System-wide Recent Requests Table */}
          <div className="card">
            <h3 className="card-title">Recent System Leave Applications</h3>
            {loading ? (
              <p style={{ color: '#64748b' }}>Loading records...</p>
            ) : !summary?.recentRequests?.length ? (
              <p style={{ color: '#94a3b8' }}>No recent requests found in the system.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th>Reviewed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentRequests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <strong>{req.employeeName}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.employeeCode}</div>
                        </td>
                        <td>{req.department}</td>
                        <td><strong>{req.leaveTypeName}</strong></td>
                        <td>{req.startDate} to {req.endDate}</td>
                        <td>{req.totalDays}</td>
                        <td><StatusBadge status={req.status} /></td>
                        <td>{req.reviewedByName || '—'}</td>
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

export default AdminDashboard;
