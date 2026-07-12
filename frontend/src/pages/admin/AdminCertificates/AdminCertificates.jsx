import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout/AdminLayout';
import adminService from '../../../services/adminService';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function AdminCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = async (p = page) => {
    try { setLoading(true);
      const res = await adminService.listCertificates({ page: p, limit: 15 });
      setCerts(res.data || []); setMeta(res.meta || null);
    } catch (err) { toast.error(err.message || 'Failed to load certificates.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await adminService.approveCertificate(id);
      toast.success('Certificate approved.');
      load();
    } catch (err) { toast.error(err.message || 'Failed to approve.'); }
    finally { setActionLoading(null); }
  };

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Certificates</h1>
      <p className="admin-page-subtitle">Review and approve generated certificates for students.</p>
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="glass-card admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Cert No.</th><th>Student</th><th>Course</th><th>Generated</th><th>Approved</th><th>Actions</th></tr></thead>
              <tbody>
                {certs.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>No certificates found.</td></tr>
                ) : certs.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-primary)' }}>{c.cert_number || '—'}</td>
                    <td>{c.enrollment?.student?.full_name || '—'}</td>
                    <td>{c.enrollment?.course?.title || '—'}</td>
                    <td>{c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <span className={`badge ${c.is_approved ? 'badge-success' : 'badge-accent'}`}>
                        {c.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!c.is_approved && (
                        <button className="admin-action-btn admin-btn-confirm" disabled={actionLoading === c.id} onClick={() => handleApprove(c.id)} id={`approve-cert-${c.id}`}>
                          {actionLoading === c.id ? '...' : 'Approve'}
                        </button>
                      )}
                    </td>
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
