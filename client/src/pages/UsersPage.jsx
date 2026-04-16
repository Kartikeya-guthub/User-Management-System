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
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

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
    <div className="page">
      <section className="surface page-header">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>User management</h1>
          <p>
            Browse, filter, and maintain user accounts. {isAdmin ? 'As an admin you can also create and deactivate accounts.' : 'As a manager you can review and update non-admin users.'}
          </p>
        </div>

        {isAdmin && (
          <button onClick={() => navigate('/users/create')} className="btn btn--primary">
            + Create User
          </button>
        )}
      </section>

      <section className="surface toolbar">
        <input
          placeholder="Search name, username, or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="input search-input"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input select-input">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input select-input">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={() => { setSearchInput(''); setSearch(''); setRole(''); setStatus(''); setPage(1); }} className="btn btn--secondary">
          Clear
        </button>
        <div className="toolbar__meta">
          <span className="badge badge--neutral">{total} records</span>
          <span className="badge badge--info">Page {page} of {pages}</span>
        </div>
      </section>

      {error ? (
        <div className="alert alert--danger">{error}</div>
      ) : loading ? (
        <div className="surface empty-state">Loading users...</div>
      ) : (
        <div className="surface table-shell">
          <table className="table">
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Username</th>
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
                  <td colSpan={7} className="empty-cell">
                    <div className="empty-state__title">No users found</div>
                    <div className="empty-state__text">Try adjusting your search or filters.</div>
                  </td>
                </tr>
              ) : users.map((u) => (
                <tr key={u._id}>
                  <td style={td}>{u.name}</td>
                  <td style={td}>{u.username || '—'}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}><span className={`badge badge--role badge--role-${u.role}`}>{u.role}</span></td>
                  <td style={td}>
                    <span className={`badge ${u.status === 'active' ? 'badge--success' : 'badge--warning'}`}>{u.status}</span>
                  </td>
                  <td style={td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={td}>
                    <button onClick={() => navigate(`/users/${u._id}`)} className="btn btn--chip btn--info">
                      View
                    </button>
                    {!(isManager && u.role === 'admin') && (
                      <button onClick={() => navigate(`/users/${u._id}/edit`)} className="btn btn--chip btn--warning">
                        Edit
                      </button>
                    )}
                    {isAdmin && u.status === 'active' && u._id !== user?._id && (
                      <button onClick={() => setDeactivateModal(u._id)} className="btn btn--chip btn--danger">
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

      {!error && total > 0 && (
        <div className="pagination surface">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="btn btn--secondary btn--sm"
          >
            ← Prev
          </button>

          {(() => {
            const pageButtons = [];
            const delta = 2;
            const start = Math.max(1, page - delta);
            const end   = Math.min(pages, page + delta);

            if (start > 1) {
              pageButtons.push(
                <button key={1} onClick={() => setPage(1)}
                  className="btn btn--ghost btn--sm">
                  1
                </button>
              );
              if (start > 2) pageButtons.push(<span key="ellipsis-start" className="pagination__ellipsis">…</span>);
            }

            for (let i = start; i <= end; i++) {
              const isActive = i === page;
              pageButtons.push(
                <button key={i} onClick={() => setPage(i)}
                  className={`btn btn--sm ${isActive ? 'btn--primary' : 'btn--ghost'}`}
                  disabled={isActive}
                >
                  {i}
                </button>
              );
            }

            if (end < pages) {
              if (end < pages - 1) pageButtons.push(<span key="ellipsis-end" className="pagination__ellipsis">…</span>);
              pageButtons.push(
                <button key={pages} onClick={() => setPage(pages)}
                  className="btn btn--ghost btn--sm">
                  {pages}
                </button>
              );
            }

            return pageButtons;
          })()}

          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages || loading}
            className="btn btn--secondary btn--sm"
          >
            Next →
          </button>

          <span className="pagination__summary">
            {total} total record{total !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {deactivateModal && (
        <div className="modal-backdrop">
          <div className="modal surface">
            <h3>Confirm deactivation</h3>
            <p>This user will be set inactive and can no longer log in until reactivated.</p>
            <div className="modal__actions">
              <button onClick={() => setDeactivateModal(null)} className="btn btn--secondary">
                Cancel
              </button>
              <button onClick={handleDeactivate} className="btn btn--danger">
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
