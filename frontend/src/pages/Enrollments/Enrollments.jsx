import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import enrollmentService from '../../services/enrollmentService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-hot-toast';
import './Enrollments.css';

const STATUS_CONFIG = {
  pending:   { label: 'Pending Approval', icon: <AlertCircle size={14} />, cls: 'badge-accent' },
  approved:  { label: 'Approved',         icon: <CheckCircle size={14} />, cls: 'badge-success' },
  rejected:  { label: 'Rejected',         icon: <XCircle size={14} />,    cls: 'badge-danger' },
  completed: { label: 'Completed',        icon: <CheckCircle size={14} />, cls: 'badge-primary' },
};

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        const res = await enrollmentService.myEnrollments({ page, limit: 10 });
        setEnrollments(res.data || []);
        setMeta(res.meta || null);
      } catch (err) {
        toast.error(err.message || 'Failed to load enrollments.');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [page]);

  return (
    <div className="enrollments-page section">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My <span className="gradient-text">Enrollments</span></h1>
          <p className="page-subtitle">Track your internship and course progress in one place.</p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : enrollments.length === 0 ? (
          <div className="empty-state glass-card">
            <BookOpen size={48} className="empty-icon" />
            <h3>No Enrollments Yet</h3>
            <p>Browse and enroll in internship programs to get started.</p>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Browse Programs
            </Link>
          </div>
        ) : (
          <>
            <div className="enrollments-list">
              {enrollments.map((enr) => {
                const status = STATUS_CONFIG[enr.status] || STATUS_CONFIG.pending;
                const progress = enr.progress_percent ?? 0;
                return (
                  <div key={enr.id} className="enrollment-card glass-card animate-fade-in">
                    <div className="enrollment-card-top">
                      <div className="enrollment-info">
                        <h3 className="enrollment-title">{enr.course?.title || 'Course'}</h3>
                        <p className="enrollment-meta">
                          <Clock size={14} />
                          Enrolled {new Date(enr.enrolled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`badge ${status.cls}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>

                    <div className="progress-section">
                      <div className="progress-label">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="enrollment-card-footer">
                      <div className="fee-info">
                        <span className="fee-label">Fee:</span>
                        <span className="fee-value">
                          ₹{Number(enr.fee_paid ?? 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <Link
                        to={`/enrollments/${enr.id}`}
                        className="btn btn-sm btn-outline"
                        id={`view-enrollment-${enr.id}`}
                      >
                        View Details <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="pagination-row">
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  id="prev-page-btn"
                >
                  Previous
                </button>
                <span className="page-indicator">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  id="next-page-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
