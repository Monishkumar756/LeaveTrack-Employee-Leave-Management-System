import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';

const LeaveApprovalPage = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState('APPROVED');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/leaves/manager/pending');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load leave approval requests', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (req, type) => {
    setSelectedReq(req);
    setActionType(type);
    setComment('');
  };

  const closeModal = () => {
    setSelectedReq(null);
    setComment('');
  };

  const handleReview = async () => {
    if (!selectedReq) return;
    setSubmitting(true);
    setMessage('');

    try {
      await api.put(`/leaves/${selectedReq.id}/review`, {
        status: actionType,
        comment: comment.trim() || (actionType === 'APPROVED' ? 'Approved by manager.' : 'Rejected by manager.'),
      });

      setMessage(`Leave request #${selectedReq.id} marked as ${actionType}.`);
      closeModal();
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process leave action.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === 'ALL'
    ? requests
    : requests.filter((r) => r.status === filter);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Leave Approval Management" />
        <main className="page-body">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="card-title" style={{ margin: 0 }}>Team Leave Approvals</h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Review, approve, or reject employee leave requests with optional feedback comments
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
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

            {message && <div className="alert alert-success">{message}</div>}

            {loading ? (
              <p style={{ color: '#64748b' }}>Loading team requests...</p>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                No leave requests found matching filter "{filter}".
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Leave Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Manager Comment</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((req) => (
                      <tr key={req.id}>
                        <td>
                          <strong>{req.employeeName}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {req.employeeCode} | {req.department}
                          </div>
                        </td>
                        <td><strong>{req.leaveTypeName}</strong></td>
                        <td>{req.startDate} to {req.endDate}</td>
                        <td>{req.totalDays}</td>
                        <td style={{ maxWidth: 220, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {req.reason}
                        </td>
                        <td><StatusBadge status={req.status} /></td>
                        <td style={{ color: '#64748b' }}>{req.managerComment || '—'}</td>
                        <td>
                          {req.status === 'PENDING' ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => openModal(req, 'APPROVED')}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => openModal(req, 'REJECTED')}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Confirmation Modal */}
          {selectedReq && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">
                    {actionType === 'APPROVED' ? 'Approve' : 'Reject'} Leave Request #{selectedReq.id}
                  </h3>
                  <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Employee: <strong>{selectedReq.employeeName}</strong> ({selectedReq.department})<br />
                    Leave Type: <strong>{selectedReq.leaveTypeName}</strong> ({selectedReq.totalDays} working days)<br />
                    Dates: <strong>{selectedReq.startDate} to {selectedReq.endDate}</strong><br />
                    Reason: <em>"{selectedReq.reason}"</em>
                  </p>

                  <div className="form-group">
                    <label className="form-label">
                      Manager Comments {actionType === 'REJECTED' && <span style={{ color: '#dc2626' }}>*</span>}
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder={
                        actionType === 'APPROVED'
                          ? 'Optional approval note (e.g., Approved. Enjoy your leave!)'
                          : 'Please specify reason for rejection...'
                      }
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required={actionType === 'REJECTED'}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    className={`btn ${actionType === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
                    onClick={handleReview}
                    disabled={submitting || (actionType === 'REJECTED' && !comment.trim())}
                  >
                    {submitting ? 'Processing...' : `Confirm ${actionType}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LeaveApprovalPage;
