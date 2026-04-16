import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EditUserPage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ name: '', username: '', email: '', role: '', status: '' });
  const [target,  setTarget]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [touched, setTouched] = useState({});

  // Inline validation
  const nameError  = touched.name  && !form.name.trim()                              ? 'Name is required.'           : null;
  const usernameError = touched.username && form.username && !/^[A-Za-z0-9._-]+$/.test(form.username) ? 'Use letters, numbers, dots, underscores, or hyphens.' : null;
  const emailError = touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Enter a valid email address.' : null;
  const hasErrors  = !!nameError || !!usernameError || !!emailError;

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        const u = data.data;
        setTarget(u);
        setForm({ name: u.name, username: u.username || '', email: u.email, role: u.role, status: u.status });
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to load user', 'error');
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, username: true, email: true });
    if (!form.name.trim()) return;
    if (form.username && !/^[A-Za-z0-9._-]+$/.test(form.username)) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return;
    setSaving(true);
    try {
      await api.put(`/users/${id}`, form);
      addToast('User updated successfully');
      navigate(`/users/${id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="surface empty-state">Loading...</div>;

  const isAdmin   = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';

  // Manager cannot edit admin users
  if (isManager && target?.role === 'admin') {
    return <div className="surface empty-state">Not authorized to edit admin users.</div>;
  }

  return (
    <div className="page page--narrow">
      <section className="surface page-header page-header--stacked">
        <div>
          <span className="eyebrow">User management</span>
          <h1>Edit user</h1>
          <p>Update account details, role, and status for the selected user.</p>
        </div>
        <span className={`badge badge--role badge--role-${target?.role || 'user'}`}>{target?.role}</span>
      </section>

      <form onSubmit={handleSubmit} className="surface form-card">
        <div className="form-grid">
          <label className="field">
            <span>Name</span>
            <input
              className={nameError ? 'input input--error' : 'input'}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            />
            {nameError && <p className="field-error">{nameError}</p>}
          </label>

          <label className="field">
            <span>Username</span>
            <input
              className={usernameError ? 'input input--error' : 'input'}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              placeholder="adminuser"
            />
            {usernameError && <p className="field-error">{usernameError}</p>}
          </label>

          {(isAdmin || isManager) && (
            <label className="field">
              <span>Email</span>
              <input
                className={emailError ? 'input input--error' : 'input'}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              />
              {emailError && <p className="field-error">{emailError}</p>}
            </label>
          )}

          {(isAdmin || isManager) && (
            <label className="field">
              <span>Role</span>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {isAdmin && <option value="admin">Admin</option>}
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </label>
          )}

          {(isAdmin || isManager) && (
            <label className="field">
              <span>Status</span>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving || hasErrors} className="btn btn--primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate(`/users/${id}`)} className="btn btn--secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;
