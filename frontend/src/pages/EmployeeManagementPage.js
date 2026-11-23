import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const initialForm = {
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    department: 'Engineering',
    role: 'ROLE_EMPLOYEE',
    managerId: '',
    status: 'ACTIVE',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, mgrRes] = await Promise.all([
        api.get('/employees'),
        api.get('/employees/managers'),
      ]);
      setEmployees(empRes.data);
      setManagers(mgrRes.data);
    } catch (err) {
      console.error('Failed to load employees', err);
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

  const handleOpenEdit = (emp) => {
    setIsEditing(true);
    setCurrentId(emp.id);
    setFormData({
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      password: '',
      phone: emp.phone || '',
      department: emp.department,
      role: emp.role,
      managerId: emp.managerId || '',
      status: emp.status,
    });
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee? This will remove all their records.')) {
      return;
    }

    try {
      await api.delete(`/employees/${id}`);
      setMessage('Employee deleted successfully.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (isEditing) {
        await api.put(`/employees/${currentId}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          department: formData.department,
          role: formData.role,
          managerId: formData.managerId ? Number(formData.managerId) : null,
          status: formData.status,
        });
        setMessage('Employee details updated successfully.');
      } else {
        await api.post('/auth/register', {
          ...formData,
          managerId: formData.managerId ? Number(formData.managerId) : null,
        });
        setMessage('New employee registered and leave balances allocated.');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee.');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Employee Directory" />
        <main className="page-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>
                Employee Management Directory
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Add, edit, manage permissions, and assign reporting managers
              </p>
            </div>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              + Add New Employee
            </button>
          </div>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card">
            {loading ? (
              <p style={{ color: '#64748b' }}>Loading directory...</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Emp Code</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Reporting Manager</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id}>
                        <td><strong>{emp.employeeId}</strong></td>
                        <td>{emp.fullName}</td>
                        <td>{emp.email}</td>
                        <td>{emp.department}</td>
                        <td>
                          <span className="badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                            {emp.role.replace('ROLE_', '')}
                          </span>
                        </td>
                        <td>{emp.managerName || '—'}</td>
                        <td>
                          <span className={`badge ${emp.status === 'ACTIVE' ? 'badge-approved' : 'badge-rejected'}`}>
                            {emp.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleOpenEdit(emp)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(emp.id)}
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
              <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
                <div className="modal-header">
                  <h3 className="modal-title">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h3>
                  <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {error && <div className="alert alert-danger">{error}</div>}

                    {!isEditing && (
                      <div className="form-group">
                        <label className="form-label">Employee ID</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. EMP106"
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                          required
                        />
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    {!isEditing && (
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Password</label>
                          <input
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Department</label>
                        <select
                          className="form-control"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        >
                          <option value="Engineering">Engineering</option>
                          <option value="Human Resources">Human Resources</option>
                          <option value="Finance">Finance</option>
                          <option value="Sales">Sales</option>
                          <option value="Marketing">Marketing</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Role</label>
                        <select
                          className="form-control"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                          <option value="ROLE_EMPLOYEE">Employee</option>
                          <option value="ROLE_MANAGER">Manager</option>
                          <option value="ROLE_ADMIN">Administrator</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Reporting Manager</label>
                        <select
                          className="form-control"
                          value={formData.managerId}
                          onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                        >
                          <option value="">None (Top-Level)</option>
                          {managers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.fullName} ({m.department})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="form-group">
                        <label className="form-label">Account Status</label>
                        <select
                          className="form-control"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {isEditing ? 'Save Changes' : 'Create Employee'}
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

export default EmployeeManagementPage;
