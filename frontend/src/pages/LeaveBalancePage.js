import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const LeaveBalancePage = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      const res = await api.get('/balances/my-balances');
      setBalances(res.data);
    } catch (err) {
      console.error('Failed to load leave balances', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Leave Balances" />
        <main className="page-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
                Leave Balance Quota - {currentYear}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Summary of your entitled, consumed, and remaining leaves for the calendar year
              </p>
            </div>
            <Link to="/apply-leave" className="btn btn-primary">
              + Apply for Leave
            </Link>
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>Loading balances...</p>
          ) : (
            <>
              {/* Visual Balance Cards */}
              <div className="grid-3" style={{ marginBottom: '2rem' }}>
                {balances.map((b) => {
                  const percentUsed = b.totalDays > 0 ? Math.round((b.usedDays / b.totalDays) * 100) : 0;
                  return (
                    <div key={b.id} className="card" style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
                          {b.leaveTypeName}
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Year {b.year}</span>
                      </div>

                      <div style={{ margin: '1rem 0' }}>
                        <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#2563eb' }}>
                          {b.remainingDays}
                          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 400, marginLeft: 4 }}>
                            days left
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div style={{ background: '#e2e8f0', borderRadius: 9999, height: 8, overflow: 'hidden', marginBottom: '0.75rem' }}>
                        <div
                          style={{
                            width: `${percentUsed}%`,
                            background: percentUsed > 80 ? '#dc2626' : '#2563eb',
                            height: '100%',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                        <span>Used: <strong>{b.usedDays} days</strong> ({percentUsed}%)</span>
                        <span>Total: <strong>{b.totalDays} days</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Balance Details Table */}
              <div className="card">
                <h3 className="card-title">Detailed Leave Entitlements</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Leave Type</th>
                        <th>Year</th>
                        <th>Total Allocated</th>
                        <th>Days Used</th>
                        <th>Available Balance</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balances.map((b) => (
                        <tr key={b.id}>
                          <td><strong>{b.leaveTypeName}</strong></td>
                          <td>{b.year}</td>
                          <td>{b.totalDays} days</td>
                          <td style={{ color: '#d97706', fontWeight: 600 }}>{b.usedDays} days</td>
                          <td style={{ color: '#16a34a', fontWeight: 700 }}>{b.remainingDays} days</td>
                          <td>
                            {b.remainingDays > 0 ? (
                              <span className="badge badge-approved">Available</span>
                            ) : (
                              <span className="badge badge-rejected">Exhausted</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default LeaveBalancePage;
