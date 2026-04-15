import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const { addToast } = useToast();

  const [name,     setName]     = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [touched,  setTouched]  = useState({});

  // Inline validation
  const nameError    = touched.name    && !name.trim()          ? 'Name is required.' : null;
  const confirmError = touched.confirm && password && confirm !== password ? 'Passwords do not match.' : null;
  const hasErrors    = !!nameError || !!confirmError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mark all fields touched to surface any hidden inline errors
    setTouched({ name: true, confirm: true });
    if (!name.trim()) return;
    if (password && password !== confirm) return;
    setSaving(true);
    try {
      const payload = { name };
      if (password) payload.password = password;
      await api.put(`/users/${user._id}`, payload);
      addToast('Profile updated successfully');
      setPassword('');
      setConfirm('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e0', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#4a5568' };

  return (
    <div style={{ padding: 32, maxWidth: 480 }}>
      <h2>My Profile</h2>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', marginBottom: 24 }}>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user?.role}</span></p>
        <p><strong>Status:</strong> {user?.status}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0 }}>Update Profile</h3>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Name</label>
          <input
            style={{ ...inputStyle, borderColor: nameError ? '#e53e3e' : '#cbd5e0' }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          />
          {nameError && <p style={{ margin: '4px 0 0', color: '#e53e3e', fontSize: 13 }}>{nameError}</p>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>New Password <span style={{ fontWeight: 400, color: '#718096' }}>(leave blank to keep current)</span></label>
          <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Confirm New Password</label>
          <input
            style={{ ...inputStyle, borderColor: confirmError ? '#e53e3e' : '#cbd5e0' }}
            type="password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setTouched((t) => ({ ...t, confirm: true })); }}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          />
          {confirmError && <p style={{ margin: '4px 0 0', color: '#e53e3e', fontSize: 13 }}>{confirmError}</p>}
        </div>

        {/* Role and status intentionally NOT shown — user cannot change them */}

        <button type="submit" disabled={saving || hasErrors}
          style={{ width: '100%', padding: '10px', background: (saving || hasErrors) ? '#a0aec0' : '#3182ce', color: '#fff', border: 'none', borderRadius: 6, cursor: (saving || hasErrors) ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
