import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const ApplyLeavePage = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [workingDays, setWorkingDays] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    try {
      const [typesRes, balRes] = await Promise.all([
        api.get('/leave-types/active'),
        api.get('/balances/my-balances'),
      ]);
      setLeaveTypes(typesRes.data);
      setBalances(balRes.data);
      if (typesRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, leaveTypeId: typesRes.data[0].id }));
      }
    } catch (err) {
      setError('Failed to load leave types or balances.');
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    if (s > e) return 0;

    let count = 0;
    let cur = new Date(s);
    while (cur <= e) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) { // skip Sat, Sun
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const handleDateChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    if (updated.startDate && updated.endDate) {
      setWorkingDays(calculateDays(updated.startDate, updated.endDate));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend pre-check
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (formData.startDate < today) {
      setError('Leave cannot be applied for past dates.');
      return;
    }

    // Balance check
    const selectedBal = balances.find((b) => b.leaveTypeId === Number(formData.leaveTypeId));
    if (selectedBal && workingDays > selectedBal.remainingDays) {
      setError(`Requested days (${workingDays}) exceed remaining balance (${selectedBal.remainingDays} days).`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/leaves/apply', {
        leaveTypeId: Number(formData.leaveTypeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });
      setSuccess('Leave request submitted successfully! Redirecting...');
      setTimeout(() => navigate('/leave-history'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBalance = balances.find((b) => b.leaveTypeId === Number(formData.leaveTypeId));
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Apply for Leave" />
        <main className="page-body">
          <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
            <h2 className="card-title">Leave Application Form</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Leave Type</label>
                <select
                  name="leaveTypeId"
                  className="form-control"
                  value={formData.leaveTypeId}
                  onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                  required
                >
                  {leaveTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.defaultDays} default days)
                    </option>
                  ))}
                </select>
                {selectedBalance && (
                  <span style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '0.25rem', display: 'block' }}>
                    Available balance for {selectedBalance.leaveTypeName}: <strong>{selectedBalance.remainingDays} days</strong>
                  </span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    min={todayStr}
                    className="form-control"
                    value={formData.startDate}
                    onChange={handleDateChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    min={formData.startDate || todayStr}
                    className="form-control"
                    value={formData.endDate}
                    onChange={handleDateChange}
                    required
                  />
                </div>
              </div>

              {workingDays > 0 && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', color: '#166534', fontSize: '0.875rem' }}>
                  Total Working Days: <strong>{workingDays} day{workingDays > 1 ? 's' : ''}</strong> (Weekends excluded)
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Reason for Leave</label>
                <textarea
                  name="reason"
                  className="form-control"
                  rows={4}
                  placeholder="Please state the specific reason for your leave request..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || workingDays <= 0}
                >
                  {submitting ? 'Submitting Request...' : 'Submit Leave Application'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplyLeavePage;
