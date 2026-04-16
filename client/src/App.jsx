import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import Navbar from './components/Navbar';
import './App.css';
import LoginPage       from './pages/LoginPage';
import DashboardPage   from './pages/DashboardPage';
import UsersPage       from './pages/UsersPage';
import UserDetailPage  from './pages/UserDetailPage';
import EditUserPage    from './pages/EditUserPage';
import CreateUserPage  from './pages/CreateUserPage';
import ProfilePage     from './pages/ProfilePage';

const App = () => {
  const { token } = useAuth();

  return (
    <div className="app-shell">
      <div className="app-shell__glow app-shell__glow--a" />
      <div className="app-shell__glow app-shell__glow--b" />
      <div className="app-shell__glow app-shell__glow--c" />

      {token && <Navbar />}

      <main className="app-shell__main">
        <Routes>
          {/* Public */}
          <Route
            path="/login"
            element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />

          {/* Protected — any logged-in user */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin + Manager — user list and detail */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin', 'manager']}>
                  <UsersPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin', 'manager']}>
                  <UserDetailPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id/edit"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin', 'manager']}>
                  <EditUserPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Admin only — create user */}
          <Route
            path="/users/create"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <CreateUserPage />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
