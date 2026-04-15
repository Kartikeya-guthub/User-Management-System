import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 32px', background: '#1a202c', color: '#fff',
  };
  const linkStyle = { color: '#cbd5e0', textDecoration: 'none', marginRight: 20 };

  return (
    <nav style={navStyle}>
      <div>
        <Link to="/dashboard" style={{ ...linkStyle, fontWeight: 700, fontSize: 18, color: '#fff' }}>
          UMS
        </Link>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>

        {/* Admin + Manager only */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Link to="/users" style={linkStyle}>Users</Link>
        )}

        <Link to="/profile" style={linkStyle}>Profile</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ color: '#a0aec0', fontSize: 14 }}>
          {user?.name} ({user?.role})
        </span>
        <button
          onClick={logout}
          style={{ padding: '6px 14px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
