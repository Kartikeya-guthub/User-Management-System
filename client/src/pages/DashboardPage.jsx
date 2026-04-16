import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  return (
    <div className="page">
      <section className="surface dashboard-hero">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Welcome back, {user?.name}.</h1>
          <p>
            You are signed in as a <strong>{user?.role}</strong>. Use the cards below to move
            between account management and your own profile.
          </p>

          <div className="hero-badges">
            <span className="badge badge--info">{user?.email}</span>
            <span className="badge badge--success">{user?.status || 'active'}</span>
            <span className="badge badge--neutral">RBAC enabled</span>
          </div>
        </div>

        <div className="dashboard-hero__panel">
          <div className="stat-card stat-card--accent">
            <span className="stat-label">Role</span>
            <strong className="stat-value">{user?.role}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Access</span>
            <strong className="stat-value">{isAdmin || isManager ? 'User management' : 'Self-service'}</strong>
          </div>
        </div>
      </section>

      <section className="section-grid">
        {(isAdmin || isManager) && (
          <article className="action-card surface" onClick={() => navigate('/users')}>
            <div className="action-card__badge">
              <span className="badge badge--primary">Admin & Manager</span>
            </div>
            <div className="action-card__icon">Users</div>
            <h2>Manage accounts</h2>
            <p>Search, filter, update, and review all user records from one place.</p>
            <span className="action-card__link">Open user list</span>
          </article>
        )}

        {isAdmin && (
          <article className="action-card surface" onClick={() => navigate('/users/create')}>
            <div className="action-card__badge">
              <span className="badge badge--warning">Admin only</span>
            </div>
            <div className="action-card__icon">Add</div>
            <h2>Create user</h2>
            <p>Provision new accounts with a role, status, and optional password.</p>
            <span className="action-card__link">Create account</span>
          </article>
        )}

        <article className="action-card surface" onClick={() => navigate('/profile')}>
          <div className="action-card__badge">
            <span className="badge badge--success">All roles</span>
          </div>
          <div className="action-card__icon">Profile</div>
          <h2>My profile</h2>
          <p>Update your display name and change your password securely.</p>
          <span className="action-card__link">Edit profile</span>
        </article>
      </section>
    </div>
  );
};

export default DashboardPage;
