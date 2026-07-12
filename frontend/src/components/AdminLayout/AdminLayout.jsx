import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, CreditCard, Award,
  Briefcase, FileText, Bell, ActivitySquare, LogOut, Shield
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-hot-toast';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard',     icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/admin/enrollments',   icon: <Users size={18} />,           label: 'Enrollments' },
  { to: '/admin/payments',      icon: <CreditCard size={18} />,      label: 'Payments' },
  { to: '/admin/certificates',  icon: <Award size={18} />,           label: 'Certificates' },
  { to: '/admin/jobs',          icon: <Briefcase size={18} />,       label: 'Jobs' },
  { to: '/admin/blog',          icon: <FileText size={18} />,        label: 'Blog' },
  { to: '/admin/notifications', icon: <Bell size={18} />,            label: 'Notifications' },
  { to: '/admin/activity-logs', icon: <ActivitySquare size={18} />,  label: 'Activity Logs' },
];

export default function AdminLayout({ children }) {
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    toast.success('Logged out from admin panel.');
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Shield size={22} />
          <span>Admin Panel</span>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              id={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">{admin?.full_name?.charAt(0) || 'A'}</div>
            <div>
              <p className="admin-name">{admin?.full_name || 'Admin'}</p>
              <p className="admin-role">{admin?.roles?.[0] || 'Administrator'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn" id="admin-logout-btn">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">{children}</main>
    </div>
  );
}
