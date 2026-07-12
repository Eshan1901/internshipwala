import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, RefreshCw, IndianRupee } from 'lucide-react';
import paymentService from '../../services/paymentService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-hot-toast';
import './Payments.css';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   icon: <Clock size={14} />,       cls: 'badge-accent' },
  confirmed: { label: 'Confirmed', icon: <CheckCircle size={14} />, cls: 'badge-success' },
  rejected:  { label: 'Rejected',  icon: <XCircle size={14} />,     cls: 'badge-danger' },
  refunded:  { label: 'Refunded',  icon: <RefreshCw size={14} />,   cls: 'badge-primary' },
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await paymentService.myPayments({ page, limit: 10 });
        setPayments(res.data || []);
        setMeta(res.meta || null);
      } catch (err) {
        toast.error(err.message || 'Failed to load payment history.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [page]);

  const totalPaid = payments
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  return (
    <div className="payments-page section">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My <span className="gradient-text">Payments</span></h1>
          <p className="page-subtitle">View your complete payment history and transaction status.</p>
        </div>

        {!loading && payments.length > 0 && (
          <div className="payment-summary-card glass-card animate-fade-in">
            <div className="summary-item">
              <IndianRupee size={20} />
              <div>
                <p className="summary-label">Total Confirmed Paid</p>
                <p className="summary-value">₹{totalPaid.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="summary-item">
              <CreditCard size={20} />
              <div>
                <p className="summary-label">Total Transactions</p>
                <p className="summary-value">{meta?.total ?? payments.length}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : payments.length === 0 ? (
          <div className="empty-state glass-card">
            <CreditCard size={48} className="empty-icon" />
            <h3>No Payment Records</h3>
            <p>Your payment history will appear here after your first enrollment.</p>
          </div>
        ) : (
          <>
            <div className="payments-table-wrapper glass-card">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Course</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((pay) => {
                    const status = STATUS_CONFIG[pay.status] || STATUS_CONFIG.pending;
                    return (
                      <tr key={pay.id}>
                        <td>{new Date(pay.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="course-name-cell">
                          {pay.enrollment?.course?.title || '—'}
                        </td>
                        <td className="amount-cell">
                          ₹{Number(pay.amount ?? 0).toLocaleString('en-IN')}
                        </td>
                        <td className="mode-cell">{pay.payment_mode || '—'}</td>
                        <td>
                          <span className={`badge ${status.cls}`}>
                            {status.icon} {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="pagination-row">
                <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} id="prev-pay-page">Previous</button>
                <span className="page-indicator">Page {meta.page} of {meta.totalPages}</span>
                <button className="btn btn-outline btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)} id="next-pay-page">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
