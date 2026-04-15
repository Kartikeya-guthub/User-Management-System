import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const UsersPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('');
  const [status,  setStatus]  = useState('');
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [total,   setTotal]   = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (role)   params.role   = role;
      if (status) params.status = status;

      const { data } = await api.get('/users', { params });
      setUsers(data.data);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, role, status]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, role, status]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      addToast('User deactivated successfully');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to deactivate user', 'error');
    }
  };

  const th = { padding: '10px 14px', textAlign: 'left', background: '#2d3748', color: '#e2e8f0', fontWeight: 600 };
  const td = { padding: '10px 14px', borderBottom: '1px solid #e2e8f0', color: '#2d3748' };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>User Management</h2>
        {/* Create User — Admin only */}
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/users/create')}
            style={{ padding: '8px 18px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            + Create User
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e0', minWidth: 220 }}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e0' }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e0' }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={() => { setSearch(''); setRole(''); setStatus(''); setPage(1); }}
          style={{ padding: '8px 14px', background: '#718096', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Clear
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Role</th>
                <th style={th}>Status</th>
                <th style={th}>Created At</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} style={{ ...td, textAlign: 'center' }}>No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id}>
                  <td style={td}>{u.name}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}><span style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                  <td style={td}>
                    <span style={{ color: u.status === 'active' ? '#38a169' : '#e53e3e', fontWeight: 600 }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={td}>
                    <button onClick={() => navigate(`/users/${u._id}`)}
                      style={{ marginRight: 6, padding: '4px 10px', borderRadius: 4, border: '1px solid #3182ce', background: '#ebf8ff', color: '#3182ce', cursor: 'pointer' }}>
                      View
                    </button>
                    {/* Edit: hide for user role when viewing admin */}
                    {!(user?.role === 'manager' && u.role === 'admin') && (
                      <button onClick={() => navigate(`/users/${u._id}/edit`)}
                        style={{ marginRight: 6, padding: '4px 10px', borderRadius: 4, border: '1px solid #d69e2e', background: '#fffff0', color: '#d69e2e', cursor: 'pointer' }}>
                        Edit
                      </button>
                    )}
                    {/* Deactivate: Admin only, only active users, not self */}
                    {user?.role === 'admin' && u.status === 'active' && u._id !== user?._id && (
                      <button onClick={() => handleDeactivate(u._id)}
                        style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid #e53e3e', background: '#fff5f5', color: '#e53e3e', cursor: 'pointer' }}>
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
          style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid #cbd5e0', cursor: page === 1 ? 'not-allowed' : 'pointer', background: page === 1 ? '#edf2f7' : '#fff' }}>
          Prev
        </button>
        <span style={{ color: '#4a5568' }}>Page {page} of {pages} ({total} total)</span>
        <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
          style={{ padding: '6px 14px', borderRadius: 4, border: '1px solid #cbd5e0', cursor: page === pages ? 'not-allowed' : 'pointer', background: page === pages ? '#edf2f7' : '#fff' }}>
          Next
        </button>
      </div>
    </div>
  );
};

export default UsersPage;
