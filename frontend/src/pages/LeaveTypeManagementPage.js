import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const LeaveTypeManagementPage = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const initialForm = {
    name: '',
    description: '',
    defaultDays: 10,
    carryForward: false,
    isActive: true,
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await api.get('/leave-types');
      setTypes(res.data);
    } catch (err) {
      console.error('Failed to load leave types', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData(initialForm);
    setShowModal(true);
    setError('');
  };

  const handleOpenEdit = (t) => {
    setIsEditing(true);
    setCurrentId(t.id);
    setFormData({
      name: t.name,
      description: t.description || '',
      defaultDays: t.defaultDays,
      carryForward: t.carryForward,
      isActive: t.isActive,
    });
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave type?')) {
      return;
    }

    try {
      await api.delete(`/leave-types/${id}`);
      setMessage('Leave type deleted successfully.');
      fetchTypes();
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot delete leave type in use.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (isEditing) {
        await api.put(`/leave-types/${currentId}`, formData);
        setMessage('Leave type updated successfully.');
      } else {
        await api.post('/leave-types', formData);
        setMessage('New leave type created successfully.');
      }
      setShowModal(false);
      fetchTypes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save leave type.');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Leave Policies" />
        <main className="page-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
                Leave Type Policies & Quotas
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Define enterprise leave categories, default annual allowances, and carry-over configurations
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              + Add Leave Type
            </button>
          </div>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card">
            {loading ? (
              <p style={{ color: '#64748b' }}>Loading leave policies...</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Policy Name</th>
                      <th>Description</th>
                      <th>Default Annual Quota</th>
                      <th>Carry Forward</th>
                      <th>Active Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {types.map((t) => (
                      <tr key={t.id}>
                        <td><strong>{t.name}</strong></td>
                        <td style={{ color: '#64748b', maxWidth: 300 }}>{t.description || '—'}</td>
                        <td>{t.defaultDays} days</td>
                        <td>
                          <span className={`badge ${t.carryForward ? 'badge-approved' : 'badge-cancelled'}`}>
                            {t.carryForward ? 'YES' : 'NO'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${t.isActive ? 'badge-approved' : 'badge-rejected'}`}>
                            {t.isActive ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenEdit(t)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(t.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add / Edit Modal */}
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3 className="modal-title">{isEditing ? 'Edit Leave Type' : 'Add Leave Type'}</h3>
                  <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div className="form-group">
                      <label className="form-label">Leave Type Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Sabbatical Leave"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Brief explanation of policy..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Default Annual Quota (Days)</label>
                      <input
                        type="number"
                        min={1}
                        max={365}
                        className="form-control"
                        value={formData.defaultDays}
                        onChange={(e) => setFormData({ ...formData, defaultDays: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.carryForward}
                          onChange={(e) => setFormData({ ...formData, carryForward: e.target.checked })}
                        />
                        Allow Carry Forward to Next Year
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        Active for Applications
                      </label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {isEditing ? 'Save Policy' : 'Create Policy'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LeaveTypeManagementPage;
