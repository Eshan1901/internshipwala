import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout/AdminLayout';
import adminService from '../../../services/adminService';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  const load = async (p = page) => {
    try { setLoading(true);
      const res = await adminService.getActivityLogs({ page: p, limit: 20 });
      setLogs(res.data || []); setMeta(res.meta || null);
    } catch (err) { toast.error(err.message || 'Failed to load activity logs.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Activity Logs</h1>
      <p className="admin-page-subtitle">Audit trail of all admin actions on the platform.</p>
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="glass-card admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Admin</th><th>Action</th><th>Entity</th><th>Entity ID</th><th>Date</th></tr></thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>No activity logs found.</td></tr>
                ) : logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.admin?.full_name || '—'}</td>
                    <td><span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>{log.action}</span></td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{log.entity_type || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-text-muted)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.entity_id || '—'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="admin-pagination">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p-1)}>Prev</button>
              <span>Page {meta.page} of {meta.totalPages}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p+1)}>Next</button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
