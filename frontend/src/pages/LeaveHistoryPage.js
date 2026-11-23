import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';

const LeaveHistoryPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/leaves/my-leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to load leave history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) {
      return;
    }

    try {
      await api.put(`/leaves/${id}/cancel`);
      setActionMsg('Leave request cancelled successfully.');
      fetchHistory();
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to cancel request.');
    }
  };

  const filteredLeaves = filter === 'ALL'
    ? leaves
    : leaves.filter((l) => l.status === filter);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Leave History" />
        <main className="page-body">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="card-title" style={{ margin: 0 }}>Leave Application History</h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Track all your past and pending leave requests
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    className={`btn btn-sm ${filter === st ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {actionMsg && <div className="alert alert-success">{actionMsg}</div>}

            {loading ? (
              <p style={{ color: '#64748b' }}>Loading records...</p>
            ) : filteredLeaves.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                No records found matching filter "{filter}".
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Leave Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Working Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Reviewed By</th>
                      <th>Manager Comment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaves.map((req) => (
                      <tr key={req.id}>
                        <td>#{req.id}</td>
                        <td><strong>{req.leaveTypeName}</strong></td>
                        <td>{req.startDate}</td>
                        <td>{req.endDate}</td>
                        <td>{req.totalDays}</td>
                        <td style={{ maxWidth: 200, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {req.reason}
                        </td>
                        <td><StatusBadge status={req.status} /></td>
                        <td>{req.reviewedByName || '—'}</td>
                        <td style={{ color: '#64748b' }}>{req.managerComment || '—'}</td>
                        <td>
                          {req.status === 'PENDING' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(req.id)}
                            >
                              Cancel
                            </button>
                          )}
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

export default LeaveHistoryPage;
