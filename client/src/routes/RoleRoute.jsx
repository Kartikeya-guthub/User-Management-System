import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Blocks users whose role is not in the allowed list ───────────
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

export default RoleRoute;
