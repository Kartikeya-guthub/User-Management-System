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
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [role,    setRole]    = useState('');
  const [status,  setStatus]  = useState('');
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [total,   setTotal]   = useState(0);

  const [deactivateModal, setDeactivateModal] = useState(null);

  // Search Debounce (500ms)
  useEffect(() => {
    const handler = setTimeout(() => { setSearch(searchInput); }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

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
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
      addToast(err.response?.data?.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, role, status]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, role, status]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDeactivate = async () => {
    if (!deactivateModal) return;
    try {
      await api.delete(`/users/${deactivateModal}`);
      addToast('User deactivated successfully');
      setDeactivateModal(null);
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
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
        <button onClick={() => { setSearchInput(''); setSearch(''); setRole(''); setStatus(''); setPage(1); }}
          style={{ padding: '8px 14px', background: '#718096', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Clear
        </button>
      </div>

      {/* Table & Error Boundary */}
      {error ? (
        <div style={{ background: '#fff5f5', color: '#c53030', padding: 24, borderRadius: 8, border: '1px solid #fed7d7' }}>
          <strong>Error: </strong> {error}
        </div>
      ) : loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#718096' }}>Loading users...</div>
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
                <tr>
                  <td colSpan={6} style={{ ...td, textAlign: 'center', padding: '40px 10px', color: '#718096' }}>
                    <div style={{ fontSize: 18, marginBottom: 8 }}>No users found</div>
                    <div style={{ fontSize: 14 }}>Try adjusting your search or filters.</div>
                  </td>
                </tr>
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
                      <button onClick={() => setDeactivateModal(u._id)}
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
      {!error && total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 20, flexWrap: 'wrap' }}>
          {/* Prev */}
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            style={{
              padding: '6px 14px', borderRadius: 4, border: '1px solid #cbd5e0',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              background: '#fff', color: '#4a5568',
              opacity: page === 1 ? 0.4 : 1,
              fontWeight: 500,
            }}
          >
            ← Prev
          </button>

          {/* Numbered page buttons — window of up to 5 pages around current */}
          {(() => {
            const pageButtons = [];
            const delta = 2;
            const start = Math.max(1, page - delta);
            const end   = Math.min(pages, page + delta);

            if (start > 1) {
              pageButtons.push(
                <button key={1} onClick={() => setPage(1)}
                  style={{ padding: '6px 11px', borderRadius: 4, border: '1px solid #cbd5e0', cursor: 'pointer', background: '#fff', color: '#4a5568' }}>
                  1
                </button>
              );
              if (start > 2) pageButtons.push(<span key="ellipsis-start" style={{ padding: '6px 4px', color: '#a0aec0' }}>…</span>);
            }

            for (let i = start; i <= end; i++) {
              const isActive = i === page;
              pageButtons.push(
                <button key={i} onClick={() => setPage(i)}
                  style={{
                    padding: '6px 11px', borderRadius: 4, cursor: isActive ? 'default' : 'pointer',
                    border: isActive ? '2px solid #3182ce' : '1px solid #cbd5e0',
                    background: isActive ? '#3182ce' : '#fff',
                    color: isActive ? '#fff' : '#4a5568',
                    fontWeight: isActive ? 700 : 400,
                  }}
                  disabled={isActive}
                >
                  {i}
                </button>
              );
            }

            if (end < pages) {
              if (end < pages - 1) pageButtons.push(<span key="ellipsis-end" style={{ padding: '6px 4px', color: '#a0aec0' }}>…</span>);
              pageButtons.push(
                <button key={pages} onClick={() => setPage(pages)}
                  style={{ padding: '6px 11px', borderRadius: 4, border: '1px solid #cbd5e0', cursor: 'pointer', background: '#fff', color: '#4a5568' }}>
                  {pages}
                </button>
              );
            }

            return pageButtons;
          })()}

          {/* Next */}
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages || loading}
            style={{
              padding: '6px 14px', borderRadius: 4, border: '1px solid #cbd5e0',
              cursor: page === pages ? 'not-allowed' : 'pointer',
              background: '#fff', color: '#4a5568',
              opacity: page === pages ? 0.4 : 1,
              fontWeight: 500,
            }}
          >
            Next →
          </button>

          <span style={{ color: '#718096', fontSize: 13, marginLeft: 6 }}>
            {total} total record{total !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Deactivation Confirmation Modal */}
      {deactivateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 320, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginTop: 0, color: '#e53e3e' }}>Confirm Deactivation</h3>
            <p style={{ color: '#4a5568' }}>Are you sure you want to deactivate this user? They will no longer be able to log in.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setDeactivateModal(null)}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#edf2f7', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDeactivate}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#e53e3e', color: '#fff', cursor: 'pointer' }}>
                Deactivate User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
