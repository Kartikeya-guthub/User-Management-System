import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const UserDetailPage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/users/${id}`);
        setUser(data.data);
      } catch (err) {
        addToast(err.response?.data?.message || 'Failed to load user', 'error');
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const formatPerson = (value) => {
    if (!value) return 'System';
    if (typeof value === 'string') return value;
    return `${value.name || 'Unknown'}${value.email ? ` (${value.email})` : ''}`;
  };

  if (loading) return <div className="surface empty-state">Loading...</div>;
  if (!user)   return null;

  return (
    <div className="page page--narrow">
      <section className="surface page-header page-header--stacked">
        <div className="detail-head">
          <div className="avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div>
            <span className="eyebrow">User detail</span>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="page-actions">
          {!(currentUser?.role === 'manager' && user.role === 'admin') && (
            <button onClick={() => navigate(`/users/${id}/edit`)} className="btn btn--warning">
              Edit
            </button>
          )}
          <button onClick={() => navigate('/users')} className="btn btn--secondary">
            Back
          </button>
        </div>
      </section>

      <section className="detail-grid">
        <article className="surface detail-card">
          <div className="detail-card__header">
            <h2>Account</h2>
            <span className={`badge badge--role badge--role-${user.role}`}>{user.role}</span>
          </div>
          <dl className="detail-list">
            <div><dt>Name</dt><dd>{user.name}</dd></div>
            <div><dt>Username</dt><dd>{user.username || '—'}</dd></div>
            <div><dt>Email</dt><dd>{user.email}</dd></div>
            <div><dt>Status</dt><dd><span className={`badge ${user.status === 'active' ? 'badge--success' : 'badge--warning'}`}>{user.status}</span></dd></div>
          </dl>
        </article>

        <article className="surface detail-card">
          <div className="detail-card__header">
            <h2>Audit trail</h2>
            <span className="badge badge--info">Tracked</span>
          </div>
          <dl className="detail-list">
            <div><dt>Created at</dt><dd>{new Date(user.createdAt).toLocaleString()}</dd></div>
            <div><dt>Updated at</dt><dd>{new Date(user.updatedAt).toLocaleString()}</dd></div>
            <div><dt>Created by</dt><dd>{formatPerson(user.createdBy)}</dd></div>
            <div><dt>Updated by</dt><dd>{formatPerson(user.updatedBy)}</dd></div>
          </dl>
        </article>
      </section>
    </div>
  );
};

export default UserDetailPage;
