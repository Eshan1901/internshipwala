import { useState, useEffect } from 'react';
import {
  Users, CreditCard, Award, Briefcase, Plus, Send, FileText,
  Activity, ShieldAlert, Sparkles, TrendingUp, CheckCircle, Clock, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../components/AdminLayout/AdminLayout';
import adminService from '../../../services/adminService';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import './AdminDashboard.css';

function StatCard({ icon, label, value, color, glowClass }) {
  return (
    <div className={`admin-stat-card glass-card ${glowClass}`}>
      <div className="admin-stat-icon-wrapper" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div className="admin-stat-info">
        <p className="admin-stat-value">{value ?? '0'}</p>
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

  // Simulated chart data
  const chartData = [
    { month: 'Jan', value: 45 },
    { month: 'Feb', value: 60 },
    { month: 'Mar', value: 85 },
    { month: 'Apr', value: 70 },
    { month: 'May', value: 110 },
    { month: 'Jun', value: 140 },
  ];

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
          enrollments: enrRes.meta?.total ?? 0,
          payments: payRes.meta?.total ?? 0,
          certificates: certRes.meta?.total ?? 0,
          jobs: jobRes.meta?.total ?? 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="dashboard-container animate-fade-in">
        {/* Welcome Banner */}
        <div className="welcome-banner glass-card">
          <div className="welcome-content">
            <span className="welcome-badge"><Sparkles size={14} /> System Online</span>
            <h1 className="welcome-title">Welcome back, {admin?.full_name || 'Administrator'} 👋</h1>
            <p className="welcome-subtitle">
              You are logged in as a <strong>{admin?.roles?.[0]?.replace('_', ' ') || 'Super Admin'}</strong>. Here is the operational summary of InternshipWala.
            </p>
          </div>
          <div className="banner-visual">
            <Activity className="pulse-icon" size={64} />
          </div>
        </div>

        {loading ? (
          <div className="loading-container"><LoadingSpinner /></div>
        ) : (
          <>
            {/* Stat Cards Grid */}
            <div className="admin-stats-grid">
              <StatCard
                icon={<Users size={24} />}
                label="Total Enrollments"
                value={stats.enrollments}
                color="#6366f1"
                glowClass="glow-indigo"
              />
              <StatCard
                icon={<CreditCard size={24} />}
                label="Total Payments"
                value={stats.payments}
                color="#10b981"
                glowClass="glow-emerald"
              />
              <StatCard
                icon={<Award size={24} />}
                label="Certificates"
                value={stats.certificates}
                color="#f59e0b"
                glowClass="glow-amber"
              />
              <StatCard
                icon={<Briefcase size={24} />}
                label="Active Jobs"
                value={stats.jobs}
                color="#3b82f6"
                glowClass="glow-blue"
              />
            </div>

            {/* Dashboard Sections Grid */}
            <div className="dashboard-grid-layout">
              {/* Left Column: Charts and Activity */}
              <div className="dashboard-column-left">
                {/* Simulated Growth Chart */}
                <div className="dashboard-section-card glass-card">
                  <div className="section-card-header">
                    <h3><TrendingUp size={18} style={{ color: '#6366f1' }} /> Platform Growth Trend</h3>
                    <span className="trend-percentage">+24.5% MoM</span>
                  </div>
                  <div className="chart-wrapper">
                    <div className="chart-bar-container">
                      {chartData.map((data, i) => (
                        <div key={i} className="chart-bar-col">
                          <div className="chart-bar-hover-val">+{data.value}</div>
                          <div
                            className="chart-bar-fill"
                            style={{ height: `${(data.value / 150) * 100}%` }}
                          />
                          <span className="chart-bar-label">{data.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Enrollments Table */}
                <div className="dashboard-section-card glass-card">
                  <div className="section-card-header">
                    <h3><Clock size={18} style={{ color: '#f59e0b' }} /> Recent Enrollments</h3>
                    <Link to="/admin/enrollments" className="header-view-all">View All <ChevronRight size={14} /></Link>
                  </div>
                  {recentEnrollments.length === 0 ? (
                    <div className="no-activity-state">
                      <ShieldAlert size={28} />
                      <p>No recent student activity recorded.</p>
                    </div>
                  ) : (
                    <div className="table-container">
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
                              <td>
                                <div className="student-profile-cell">
                                  <div className="student-avatar-placeholder">
                                    {enr.student?.full_name?.charAt(0).toUpperCase() || 'S'}
                                  </div>
                                  <div className="student-details">
                                    <span className="student-name">{enr.student?.full_name || '—'}</span>
                                    <span className="student-email">{enr.student?.email || '—'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="table-course-title">{enr.course?.title || '—'}</td>
                              <td className="table-date">
                                {enr.enrolled_at ? new Date(enr.enrolled_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                              </td>
                              <td>
                                <span className={`badge badge-${enr.status === 'approved' ? 'success' : enr.status === 'rejected' ? 'danger' : 'accent'}`}>
                                  {enr.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Actions and Alerts */}
              <div className="dashboard-column-right">
                {/* Quick Shortcuts */}
                <div className="dashboard-section-card glass-card">
                  <div className="section-card-header">
                    <h3>Quick Operations</h3>
                  </div>
                  <div className="quick-actions-grid">
                    <Link to="/admin/jobs" className="quick-action-button" id="shortcut-add-job">
                      <div className="action-icon-box bg-blue"><Plus size={18} /></div>
                      <div className="action-text">
                        <span>New Job</span>
                        <p>Post hiring requirements</p>
                      </div>
                    </Link>
                    <Link to="/admin/notifications" className="quick-action-button" id="shortcut-notify">
                      <div className="action-icon-box bg-purple"><Send size={16} /></div>
                      <div className="action-text">
                        <span>Broadcast</span>
                        <p>Send notification alert</p>
                      </div>
                    </Link>
                    <Link to="/admin/blog" className="quick-action-button" id="shortcut-blog">
                      <div className="action-icon-box bg-indigo"><FileText size={16} /></div>
                      <div className="action-text">
                        <span>Write Blog</span>
                        <p>Publish guidance advice</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* System Health */}
                <div className="dashboard-section-card glass-card">
                  <div className="section-card-header">
                    <h3>System Telemetry</h3>
                  </div>
                  <div className="telemetry-list">
                    <div className="telemetry-item">
                      <span className="telemetry-label">API Status</span>
                      <span className="telemetry-value text-success"><CheckCircle size={14} /> Online</span>
                    </div>
                    <div className="telemetry-item">
                      <span className="telemetry-label">DB Server Latency</span>
                      <span className="telemetry-value">12ms</span>
                    </div>
                    <div className="telemetry-item">
                      <span className="telemetry-label">Storage Usage</span>
                      <div className="telemetry-storage-bar-group">
                        <div className="telemetry-bar-track">
                          <div className="telemetry-bar-fill" style={{ width: '42%' }} />
                        </div>
                        <span className="telemetry-value">42%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
