import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="app-nav surface">
      <div className="app-nav__brand">
        <Link to="/dashboard" className="app-nav__logo">
          UMS
        </Link>
        <div>
          <div className="app-nav__title">User Management System</div>
          <div className="app-nav__subtitle">RBAC dashboard for admin, manager and user roles</div>
        </div>
      </div>

      <div className="app-nav__links">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
          Dashboard
        </NavLink>

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <NavLink to="/users" className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
            Users
          </NavLink>
        )}

        <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}>
          Profile
        </NavLink>
      </div>

      <div className="app-nav__profile">
        <div className="app-nav__identity">
          <span className="badge badge--neutral">{user?.role}</span>
          <span className="app-nav__user">{user?.name}</span>
        </div>
        <button onClick={logout} className="btn btn--ghost btn--sm">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
