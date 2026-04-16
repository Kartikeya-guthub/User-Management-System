import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
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
      const { data } = await api.put(`/users/${user._id}`, payload);
      updateUser(data.data);
      addToast('Profile updated successfully');
      setPassword('');
      setConfirm('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page page--narrow">
      <section className="surface page-header page-header--stacked">
        <div>
          <span className="eyebrow">Self service</span>
          <h1>My profile</h1>
          <p>Update your name or change your password securely.</p>
        </div>
        <span className="badge badge--info">{user?.role}</span>
      </section>

      <section className="surface profile-summary">
        <div>
          <p className="profile-summary__label">Email</p>
          <p className="profile-summary__value">{user?.email}</p>
        </div>
        <div>
          <p className="profile-summary__label">Username</p>
          <p className="profile-summary__value">{user?.username || 'Not set'}</p>
        </div>
        <div>
          <p className="profile-summary__label">Role</p>
          <p className="profile-summary__value">{user?.role}</p>
        </div>
        <div>
          <p className="profile-summary__label">Status</p>
          <p className="profile-summary__value">{user?.status}</p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="surface form-card">
        <div className="form-grid">
          <label className="field">
            <span>Name</span>
            <input
              className={nameError ? 'input input--error' : 'input'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            />
            {nameError && <p className="field-error">{nameError}</p>}
          </label>

          <label className="field">
            <span>New Password <em>(leave blank to keep current)</em></span>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <label className="field">
            <span>Confirm New Password</span>
            <input
              className={confirmError ? 'input input--error' : 'input'}
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setTouched((t) => ({ ...t, confirm: true })); }}
              onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
            />
            {confirmError && <p className="field-error">{confirmError}</p>}
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving || hasErrors} className="btn btn--primary">
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
