import { useState, useEffect } from 'react';
import { Users, CreditCard, Award, Briefcase, FileText, TrendingUp, Clock } from 'lucide-react';
import AdminLayout from '../../../components/AdminLayout/AdminLayout';
import adminService from '../../../services/adminService';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import '../../../components/AdminLayout/AdminLayout.css';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="admin-stat-card glass-card">
      <div className="admin-stat-icon" style={{ color }}>{icon}</div>
      <div>
        <p className="admin-stat-value">{value ?? '—'}</p>
        <p className="admin-stat-label">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState({});
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.listEnrollments({ limit: 5, page: 1 }),
      adminService.listPayments({ limit: 1 }),
      adminService.listCertificates({ limit: 1 }),
      adminService.listJobs({ limit: 1 }),
    ])
      .then(([enrRes, payRes, certRes, jobRes]) => {
        setRecentEnrollments(enrRes.data?.slice(0, 5) || []);
        setStats({
          enrollments: enrRes.meta?.total ?? '—',
          payments: payRes.meta?.total ?? '—',
          certificates: certRes.meta?.total ?? '—',
          jobs: jobRes.meta?.total ?? '—',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div>
        <h1 className="admin-page-title">Welcome back, {admin?.full_name?.split(' ')[0] || 'Admin'} 👋</h1>
        <p className="admin-page-subtitle">Here's a quick overview of the platform.</p>

        {loading ? <LoadingSpinner /> : (
          <>
            <div className="admin-stats-grid">
              <StatCard icon={<Users size={22} />}    label="Total Enrollments"  value={stats.enrollments}  color="#6366f1" />
              <StatCard icon={<CreditCard size={22} />} label="Total Payments"   value={stats.payments}     color="#10b981" />
              <StatCard icon={<Award size={22} />}    label="Certificates"        value={stats.certificates} color="#f59e0b" />
              <StatCard icon={<Briefcase size={22} />} label="Active Jobs"       value={stats.jobs}         color="#3b82f6" />
            </div>

            <div className="admin-recent-section glass-card" style={{ marginTop: '2rem', borderRadius: '1rem', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={17} /> Recent Enrollments
              </h2>
              {recentEnrollments.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No enrollments yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEnrollments.map((enr) => (
                      <tr key={enr.id}>
                        <td>{enr.student?.full_name || '—'}</td>
                        <td>{enr.course?.title || '—'}</td>
                        <td>{enr.enrolled_at ? new Date(enr.enrolled_at).toLocaleDateString('en-IN') : '—'}</td>
                        <td><span className={`badge badge-${enr.status === 'approved' ? 'success' : enr.status === 'rejected' ? 'danger' : 'accent'}`}>{enr.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
