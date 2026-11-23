import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ManagerDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    try {
      const res = await api.get('/leaves/manager/pending');
      const all = res.data;
      setPendingRequests(all.filter((r) => r.status === 'PENDING'));
      setStats({
        pending: all.filter((r) => r.status === 'PENDING').length,
        approved: all.filter((r) => r.status === 'APPROVED').length,
        rejected: all.filter((r) => r.status === 'REJECTED').length,
      });
    } catch (err) {
      console.error('Failed to load manager dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Manager Dashboard" />
        <main className="page-body">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
              Manager Control Center
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Review team leave applications, manage employee workloads, and handle approvals
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid-3">
            <div className="stat-card" style={{ borderLeft: '4px solid #d97706' }}>
              <span className="stat-title">Awaiting Approval</span>
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-subtext">Requests pending your review</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
              <span className="stat-title">Team Approved Leaves</span>
              <span className="stat-value">{stats.approved}</span>
              <span className="stat-subtext">Successfully processed requests</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #dc2626' }}>
              <span className="stat-title">Rejected Requests</span>
              <span className="stat-value">{stats.rejected}</span>
              <span className="stat-subtext">Declined with feedback comments</span>
            </div>
          </div>

          {/* Pending Approval Action Table */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="card-title" style={{ margin: 0 }}>
                Pending Approval Queue ({pendingRequests.length})
              </h3>
              <Link to="/manager/approvals" className="btn btn-primary btn-sm">
                Open Approval Center →
              </Link>
            </div>

            {loading ? (
              <p style={{ color: '#64748b' }}>Loading team requests...</p>
            ) : pendingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#16a34a' }}>
                🎉 Great job! There are no pending leave requests awaiting approval.
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Leave Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <strong>{req.employeeName}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.employeeCode}</div>
                        </td>
                        <td>{req.department}</td>
                        <td><strong>{req.leaveTypeName}</strong></td>
                        <td>{req.startDate} to {req.endDate}</td>
                        <td>{req.totalDays}</td>
                        <td style={{ maxWidth: 220, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {req.reason}
                        </td>
                        <td>
                          <Link to="/manager/approvals" className="btn btn-primary btn-sm">
                            Review
                          </Link>
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

export default ManagerDashboard;
