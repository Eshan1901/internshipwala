import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Auth
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Student Pages
import Home from './pages/Home/Home';
import Courses from './pages/Courses/Courses';
import CourseDetail from './pages/CourseDetail/CourseDetail';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import VerifyOtp from './pages/VerifyOtp/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Enrollments from './pages/Enrollments/Enrollments';
import Payments from './pages/Payments/Payments';
import Certificates from './pages/Certificates/Certificates';
import Jobs from './pages/Jobs/Jobs';
import JobDetail from './pages/JobDetail/JobDetail';
import Blog from './pages/Blog/Blog';
import BlogPost from './pages/BlogPost/BlogPost';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';
import AdminEnrollments from './pages/admin/AdminEnrollments/AdminEnrollments';
import AdminPayments from './pages/admin/AdminPayments/AdminPayments';
import AdminCertificates from './pages/admin/AdminCertificates/AdminCertificates';
import AdminJobs from './pages/admin/AdminJobs/AdminJobs';
import AdminBlog from './pages/admin/AdminBlog/AdminBlog';
import AdminNotifications from './pages/admin/AdminNotifications/AdminNotifications';
import AdminActivityLogs from './pages/admin/AdminActivityLogs/AdminActivityLogs';

// Auth routes (no Navbar/Footer)
const AUTH_ROUTES = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'];
const ADMIN_ROUTES_PREFIX = '/admin';

function AppContent() {
  const location = useLocation();
  const isAuthRoute = AUTH_ROUTES.includes(location.pathname);
  const isAdminRoute = location.pathname.startsWith(ADMIN_ROUTES_PREFIX);

  const showLayout = !isAuthRoute && !isAdminRoute;

  return (
    <>
      {showLayout && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          {/* ── Auth ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ── Protected Student ── */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/enrollments" element={<ProtectedRoute><Enrollments /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />

          {/* ── Admin ── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/enrollments" element={<AdminProtectedRoute><AdminEnrollments /></AdminProtectedRoute>} />
          <Route path="/admin/payments" element={<AdminProtectedRoute><AdminPayments /></AdminProtectedRoute>} />
          <Route path="/admin/certificates" element={<AdminProtectedRoute><AdminCertificates /></AdminProtectedRoute>} />
          <Route path="/admin/jobs" element={<AdminProtectedRoute><AdminJobs /></AdminProtectedRoute>} />
          <Route path="/admin/blog" element={<AdminProtectedRoute><AdminBlog /></AdminProtectedRoute>} />
          <Route path="/admin/notifications" element={<AdminProtectedRoute><AdminNotifications /></AdminProtectedRoute>} />
          <Route path="/admin/activity-logs" element={<AdminProtectedRoute><AdminActivityLogs /></AdminProtectedRoute>} />
        </Routes>
      </main>
      {showLayout && <Footer />}
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e1e2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }, duration: 4000 }} />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AdminAuthProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </AdminAuthProvider>
    </Router>
  );
}
