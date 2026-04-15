import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

// ── Create Context ────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Initialize from localStorage for persistence across refreshes
  const [user,  setUser]  = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // ── login(): call API, store token + user ───────────────────────
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });

    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    navigate('/dashboard');
  };

  // ── logout(): clear session and redirect ────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Custom hook for consuming Auth context ────────────────────────
export const useAuth = () => useContext(AuthContext);
