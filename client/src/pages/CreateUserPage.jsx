import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const CreateUserPage = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form,   setForm]   = useState({ name: '', username: '', email: '', role: 'user', status: 'active', password: '' });
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});

  // Inline validation rules
  const nameError     = touched.name     && !form.name.trim() ? 'Name is required.' : null;
  const usernameError = touched.username && form.username && !/^[A-Za-z0-9._-]+$/.test(form.username) ? 'Use letters, numbers, dots, underscores, or hyphens.' : null;
  const emailError    = touched.email    && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Enter a valid email address.' : null;
  const passwordError = touched.password && form.password && form.password.length < 6 ? 'Password must be at least 6 characters.' : null;
  const hasErrors     = !!nameError || !!usernameError || !!emailError || !!passwordError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Surface all inline errors on submit attempt
    setTouched({ name: true, username: true, email: true, password: true });
    if (!form.name.trim()) return;
    if (form.username && !/^[A-Za-z0-9._-]+$/.test(form.username)) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return;
    if (form.password && form.password.length < 6) return;
    setSaving(true);
    try {
      await api.post('/users', form);
      addToast('User created successfully');
      navigate('/users');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page page--narrow">
      <section className="surface page-header page-header--stacked">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Create user</h1>
          <p>Create a new account with role and status controls.</p>
        </div>
        <span className="badge badge--info">Admin only</span>
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
            <span>Username <em>(optional, auto-generated if blank)</em></span>
            <input
              className={usernameError ? 'input input--error' : 'input'}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              placeholder="adminuser"
            />
            {usernameError && <p className="field-error">{usernameError}</p>}
          </label>

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

          <label className="field">
            <span>Password <em>(leave blank to auto-generate)</em></span>
            <input
              className={passwordError ? 'input input--error' : 'input'}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            />
            {passwordError && <p className="field-error">{passwordError}</p>}
          </label>

          <label className="field">
            <span>Role</span>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving || hasErrors} className="btn btn--primary">
            {saving ? 'Creating...' : 'Create User'}
          </button>
          <button type="button" onClick={() => navigate('/users')} className="btn btn--secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage;
