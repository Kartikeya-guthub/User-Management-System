import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const CreateUserPage = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form,   setForm]   = useState({ name: '', email: '', role: 'user', status: 'active', password: '' });
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});

  // Inline validation rules
  const nameError     = touched.name     && !form.name.trim() ? 'Name is required.' : null;
  const emailError    = touched.email    && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Enter a valid email address.' : null;
  const passwordError = touched.password && form.password && form.password.length < 6 ? 'Password must be at least 6 characters.' : null;
  const hasErrors     = !!nameError || !!emailError || !!passwordError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Surface all inline errors on submit attempt
    setTouched({ name: true, email: true, password: true });
    if (!form.name.trim()) return;
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

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e0', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#4a5568' };

  return (
    <div style={{ padding: 32, maxWidth: 520 }}>
      <h2>Create User</h2>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Name</label>
          <input
            style={{ ...inputStyle, borderColor: nameError ? '#e53e3e' : '#cbd5e0' }}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          />
          {nameError && <p style={{ margin: '4px 0 0', color: '#e53e3e', fontSize: 13 }}>{nameError}</p>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email</label>
          <input
            style={{ ...inputStyle, borderColor: emailError ? '#e53e3e' : '#cbd5e0' }}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          />
          {emailError && <p style={{ margin: '4px 0 0', color: '#e53e3e', fontSize: 13 }}>{emailError}</p>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Password <span style={{ fontWeight: 400, color: '#718096' }}>(leave blank to auto-generate)</span></label>
          <input
            style={{ ...inputStyle, borderColor: passwordError ? '#e53e3e' : '#cbd5e0' }}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          />
          {passwordError && <p style={{ margin: '4px 0 0', color: '#e53e3e', fontSize: 13 }}>{passwordError}</p>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Role</label>
          <select style={inputStyle} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Status</label>
          <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={saving || hasErrors}
            style={{ flex: 1, padding: '10px', background: (saving || hasErrors) ? '#a0aec0' : '#38a169', color: '#fff', border: 'none', borderRadius: 6, cursor: (saving || hasErrors) ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Creating...' : 'Create User'}
          </button>
          <button type="button" onClick={() => navigate('/users')}
            style={{ padding: '10px 18px', background: '#718096', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage;
