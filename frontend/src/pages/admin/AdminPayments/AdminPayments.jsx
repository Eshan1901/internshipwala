import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout/AdminLayout';
import adminService from '../../../services/adminService';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = async (p = page) => {
    try { setLoading(true);
      const res = await adminService.listPayments({ page: p, limit: 15 });
      setPayments(res.data || []); setMeta(res.meta || null);
    } catch (err) { toast.error(err.message || 'Failed to load payments.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const doAction = async (action, id, data = {}) => {
    setActionLoading(id + '-' + action);
    try {
      if (action === 'confirm') await adminService.confirmPayment(id, data);
      else if (action === 'reject') await adminService.rejectPayment(id, data);
      else if (action === 'refund') await adminService.refundPayment(id, data);
      toast.success(`Payment ${action}ed.`);
      load();
    } catch (err) { toast.error(err.message || `Failed to ${action}.`); }
    finally { setActionLoading(null); }
  };

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Payments</h1>
      <p className="admin-page-subtitle">Confirm, reject, or initiate refunds for student payments.</p>
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="glass-card admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Student</th><th>Course</th><th>Amount</th><th>Mode</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>No payments found.</td></tr>
                ) : payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.enrollment?.student?.full_name || '—'}</td>
                    <td>{p.enrollment?.course?.title || '—'}</td>
                    <td style={{ fontWeight: 700 }}>₹{Number(p.amount ?? 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{p.payment_mode || '—'}</td>
                    <td>{p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td><span className={`badge badge-${p.status === 'confirmed' ? 'success' : p.status === 'rejected' ? 'danger' : p.status === 'refunded' ? 'primary' : 'accent'}`}>{p.status}</span></td>
                    <td style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {p.status === 'pending' && (<>
                        <button className="admin-action-btn admin-btn-confirm" disabled={!!actionLoading} onClick={() => doAction('confirm', p.id, { gateway_txn_id: 'ADMIN-' + Date.now() })} id={`confirm-pay-${p.id}`}>Confirm</button>
                        <button className="admin-action-btn admin-btn-reject" disabled={!!actionLoading} onClick={() => doAction('reject', p.id, { reason: 'Rejected by admin.' })} id={`reject-pay-${p.id}`}>Reject</button>
                      </>)}
                      {p.status === 'confirmed' && (
                        <button className="admin-action-btn admin-btn-neutral" disabled={!!actionLoading} onClick={() => doAction('refund', p.id, { reason: 'Refund initiated by admin.' })} id={`refund-pay-${p.id}`}>Refund</button>
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
