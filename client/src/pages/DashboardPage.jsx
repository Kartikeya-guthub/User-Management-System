import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 32 }}>
      <h2>Dashboard</h2>
      <p>Welcome, <strong>{user?.name}</strong> ({user?.role})</p>
      <nav style={{ marginBottom: 24 }}>
        <a href="/users" style={{ marginRight: 16 }}>Manage Users</a>
      </nav>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default DashboardPage;
