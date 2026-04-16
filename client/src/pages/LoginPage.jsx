import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [identifier, setIdentifier] = useState('admin@system.com');
  const [password, setPassword] = useState('Admin@123');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Auto-fill admin credentials on page load
  useEffect(() => {
    setIdentifier('admin@system.com');
    setPassword('Admin@123');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || err.message || 'Login failed';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout auth-layout--single">
      <section className="auth-card auth-card--login surface">
        <div className="auth-card__header">
          <span className="eyebrow">User Management System</span>
          <h2>Welcome back</h2>
          <p>Enter your details to log in.</p>
        </div>

        {error && <div className="alert alert--danger">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Email or username</span>
            <input
              className="input"
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
              className="input"
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
