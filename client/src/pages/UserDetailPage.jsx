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

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
  if (!user)   return null;

  const row = (label, value) => (
    <tr key={label}>
      <td style={{ padding: '10px 16px', fontWeight: 600, color: '#4a5568', width: 160 }}>{label}</td>
      <td style={{ padding: '10px 16px', color: '#2d3748' }}>{value || '—'}</td>
    </tr>
  );

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>User Detail</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Edit button — hide for manager viewing admin */}
          {!(currentUser?.role === 'manager' && user.role === 'admin') && (
            <button onClick={() => navigate(`/users/${id}/edit`)}
              style={{ padding: '7px 16px', background: '#d69e2e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Edit
            </button>
          )}
          <button onClick={() => navigate('/users')}
            style={{ padding: '7px 16px', background: '#718096', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Back
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {row('Name',       user.name)}
            {row('Email',      user.email)}
            {row('Role',       user.role)}
            {row('Status',     <span style={{ color: user.status === 'active' ? '#38a169' : '#e53e3e', fontWeight: 600 }}>{user.status}</span>)}
            {row('Created At', new Date(user.createdAt).toLocaleString())}
            {row('Updated At', new Date(user.updatedAt).toLocaleString())}
            {row('Created By', user.createdBy ? `${user.createdBy.name} (${user.createdBy.email})` : 'System')}
            {row('Updated By', user.updatedBy ? `${user.updatedBy.name} (${user.updatedBy.email})` : '—')}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserDetailPage;
