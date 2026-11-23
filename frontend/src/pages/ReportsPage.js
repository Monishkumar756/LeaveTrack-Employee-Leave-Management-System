import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/monthly?year=${year}`);
      setReports(res.data);
    } catch (err) {
      console.error('Failed to load monthly reports', err);
    } finally {
      setLoading(false);
    }
  };

  const totalAnnualDays = reports.reduce((acc, r) => acc + r.totalDaysTaken, 0);
  const totalApproved = reports.reduce((acc, r) => acc + r.approvedRequests, 0);
  const totalPending = reports.reduce((acc, r) => acc + r.pendingRequests, 0);
  const totalRejected = reports.reduce((acc, r) => acc + r.rejectedRequests, 0);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Reports & Analytics" />
        <main className="page-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
                Annual Leave Utilization Reports
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Monthly audit trail of employee leave requests, approval metrics, and total days taken
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Select Year:</label>
              <select
                className="form-control"
                style={{ width: 120 }}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          {/* Annual Overview KPIs */}
          <div className="grid-4">
            <div className="stat-card">
              <span className="stat-title">Total Working Days Taken</span>
              <span className="stat-value">{totalAnnualDays}</span>
              <span className="stat-subtext">Cumulative days across all staff</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
              <span className="stat-title">Approved Leaves</span>
              <span className="stat-value">{totalApproved}</span>
              <span className="stat-subtext">Successfully processed</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #d97706' }}>
              <span className="stat-title">Pending Requests</span>
              <span className="stat-value">{totalPending}</span>
              <span className="stat-subtext">Currently under review</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #dc2626' }}>
              <span className="stat-title">Rejected Requests</span>
              <span className="stat-value">{totalRejected}</span>
              <span className="stat-subtext">Declined applications</span>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="card">
            <h3 className="card-title">Monthly Leave Breakdown ({year})</h3>
            {loading ? (
              <p style={{ color: '#64748b' }}>Calculating statistics...</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Total Applications</th>
                      <th>Approved</th>
                      <th>Rejected</th>
                      <th>Pending</th>
                      <th>Total Working Days Consumed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((m, idx) => (
                      <tr key={idx}>
                        <td><strong>{m.period}</strong></td>
                        <td>{m.totalRequests}</td>
                        <td style={{ color: '#16a34a', fontWeight: 600 }}>{m.approvedRequests}</td>
                        <td style={{ color: '#dc2626', fontWeight: 600 }}>{m.rejectedRequests}</td>
                        <td style={{ color: '#d97706', fontWeight: 600 }}>{m.pendingRequests}</td>
                        <td><strong>{m.totalDaysTaken} days</strong></td>
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

export default ReportsPage;
