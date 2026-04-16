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
        <span className="eyebrow">User Management System</span>
        <h1>Sign in to continue.</h1>
        <p>Access your account.</p>
      </section>

      <section className="auth-card surface">
        <div className="auth-card__header">
          <h2>Welcome back</h2>
          <p>Enter your details to log in.</p>
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
              placeholder="Email or username"
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
              placeholder="Password"
            />
          </label>

          <button type="submit" disabled={loading} className="btn btn--primary btn--block">
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

      </section>
    </div>
  );
};

export default LoginPage;
