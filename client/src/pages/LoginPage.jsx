import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="auth-hero surface">
        <span className="eyebrow">MERN Stack Assessment</span>
        <h1>Secure user management with role-based access control.</h1>
        <p>
          Log in to manage users, view audit information, and switch between admin, manager,
          and regular user capabilities in a clean, responsive interface.
        </p>

        <div className="feature-list">
          <div className="feature-item">
            <strong>Authentication</strong>
            <span>JWT session handling with persisted login state.</span>
          </div>
          <div className="feature-item">
            <strong>Authorization</strong>
            <span>Protected pages and UI actions based on role.</span>
          </div>
          <div className="feature-item">
            <strong>Audit trail</strong>
            <span>Created and updated metadata on user records.</span>
          </div>
        </div>
      </section>

      <section className="auth-card surface">
        <div className="auth-card__header">
          <span className="badge badge--info">Sign in</span>
          <h2>Welcome back</h2>
          <p>Use your email or username and password to access the workspace.</p>
        </div>

        {error && <div className="alert alert--danger">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Email or username</span>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              placeholder="admin or admin@system.com"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </label>

          <button type="submit" disabled={loading} className="btn btn--primary btn--block">
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="login-note">
          <span className="badge badge--neutral">Tip</span>
          <p>Use the seeded admin account from the README to demonstrate full RBAC flows.</p>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
