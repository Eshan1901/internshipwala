import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout/AdminLayout';
import adminService from '../../../services/adminService';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = async (p = page) => {
    try { setLoading(true);
      const res = await adminService.listEnrollments({ page: p, limit: 15 });
      setEnrollments(res.data || []); setMeta(res.meta || null);
    } catch (err) { toast.error(err.message || 'Failed to load enrollments.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleApprove = async (id) => {
    setActionLoading(id + '-approve');
    try {
      await adminService.approveEnrollment(id);
      toast.success('Enrollment approved.');
      load();
    } catch (err) { toast.error(err.message || 'Failed to approve.'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    setActionLoading(id + '-reject');
    try {
      await adminService.rejectEnrollment(id, { reason: 'Rejected by admin.' });
      toast.success('Enrollment rejected.');
      load();
    } catch (err) { toast.error(err.message || 'Failed to reject.'); }
    finally { setActionLoading(null); }
  };

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Enrollments</h1>
      <p className="admin-page-subtitle">Manage student course enrollments and approval requests.</p>
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="glass-card admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Student</th><th>Course</th><th>Enrolled</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {enrollments.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>No enrollments found.</td></tr>
                ) : enrollments.map((e) => (
                  <tr key={e.id}>
                    <td>{e.student?.full_name || '—'}</td>
                    <td>{e.course?.title || '—'}</td>
                    <td>{e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td>₹{Number(e.fee_paid ?? 0).toLocaleString('en-IN')}</td>
                    <td><span className={`badge badge-${e.status === 'approved' ? 'success' : e.status === 'rejected' ? 'danger' : 'accent'}`}>{e.status}</span></td>
                    <td style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {e.status === 'pending' && (<>
                        <button className="admin-action-btn admin-btn-confirm" disabled={!!actionLoading} onClick={() => handleApprove(e.id)} id={`approve-enr-${e.id}`}>Approve</button>
                        <button className="admin-action-btn admin-btn-reject" disabled={!!actionLoading} onClick={() => handleReject(e.id)} id={`reject-enr-${e.id}`}>Reject</button>
                      </>)}
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
