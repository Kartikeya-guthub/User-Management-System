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

  const [form,    setForm]    = useState({ name: '', email: '', role: '', status: '' });
  const [target,  setTarget]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [touched, setTouched] = useState({});

  // Inline validation
  const nameError  = touched.name  && !form.name.trim()                              ? 'Name is required.'           : null;
  const emailError = touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Enter a valid email address.' : null;
  const hasErrors  = !!nameError || !!emailError;

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        const u = data.data;
        setTarget(u);
        setForm({ name: u.name, email: u.email, role: u.role, status: u.status });
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
    setTouched({ name: true, email: true });
    if (!form.name.trim()) return;
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

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;

  const isAdmin   = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';

  // Manager cannot edit admin users
  if (isManager && target?.role === 'admin') {
    return <div style={{ padding: 32, color: '#e53e3e' }}>Not authorized to edit admin users.</div>;
  }

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e0', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#4a5568' };

  return (
    <div style={{ padding: 32, maxWidth: 520 }}>
      <h2>Edit User</h2>
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

        {/* Email — editable by admin and manager */}
        {(isAdmin || isManager) && (
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
        )}

        {/* Role — admin can set any, manager cannot assign admin */}
        {(isAdmin || isManager) && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Role</label>
            <select style={inputStyle} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {isAdmin && <option value="admin">Admin</option>}
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
          </div>
        )}

        {/* Status — admin and manager */}
        {(isAdmin || isManager) && (
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Status</label>
            <select style={inputStyle} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={saving || hasErrors}
            style={{ flex: 1, padding: '10px', background: (saving || hasErrors) ? '#a0aec0' : '#3182ce', color: '#fff', border: 'none', borderRadius: 6, cursor: (saving || hasErrors) ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate(`/users/${id}`)}
            style={{ padding: '10px 18px', background: '#718096', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;
