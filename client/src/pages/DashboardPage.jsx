import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cardStyle = {
    background: '#fff', padding: 20, borderRadius: 8,
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)', cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Welcome, {user?.name}!</h2>
      <p style={{ color: '#718096' }}>Role: <strong style={{ textTransform: 'capitalize' }}>{user?.role}</strong></p>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 24 }}>
        {/* Users card — admin/manager only */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <div style={cardStyle} onClick={() => navigate('/users')}>
            <h3 style={{ margin: '0 0 8px' }}>👥 Manage Users</h3>
            <p style={{ margin: 0, color: '#718096' }}>View, edit, and manage user accounts.</p>
          </div>
        )}

        <div style={cardStyle} onClick={() => navigate('/profile')}>
          <h3 style={{ margin: '0 0 8px' }}>👤 My Profile</h3>
          <p style={{ margin: 0, color: '#718096' }}>Update your name and password.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
