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
      {showLayout && (
        <>
          {/* Floating Badges on Right Edge */}
          <div className="floating-widgets-container">
            <a
              href="/courses"
              className="floating-widget-btn floating-widget-btn--industrial"
              id="float-industrial"
            >
              <span className="badge-text-new">NEW</span>
              <span>INDUSTRIAL TRAINING</span>
            </a>
            <a
              href="/courses"
              className="floating-widget-btn floating-widget-btn--beu"
              id="float-beu"
            >
              <span>BEU 5TH SEM INTERNSHIP</span>
            </a>
          </div>

          {/* Floating WhatsApp on Bottom Left */}
          <a
            href="https://wa.me/917070436444"
            className="floating-whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            id="float-whatsapp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3 1.486 5.342 1.488 5.169 0 9.38-4.185 9.384-9.316.002-2.487-.968-4.827-2.727-6.59-1.758-1.76-4.095-2.73-6.586-2.73-5.176 0-9.386 4.188-9.39 9.321-.001 2.054.536 4.062 1.554 5.81l-.997 3.638 3.725-.975zm10.748-4.733c-.279-.139-1.647-.813-1.9-.905-.253-.092-.438-.139-.623.139-.184.278-.716.905-.878 1.09-.162.186-.324.208-.603.069-.278-.139-1.176-.434-2.24-1.383-.827-.738-1.386-1.65-1.547-1.928-.163-.278-.018-.429.122-.568.125-.125.279-.324.418-.486.139-.162.185-.278.278-.463.093-.185.047-.348-.024-.487-.07-.139-.623-1.503-.853-2.059-.224-.538-.47-.464-.645-.473-.166-.008-.356-.01-.546-.01-.19 0-.501.071-.762.35-.262.278-1.002.978-1.002 2.383 0 1.405 1.023 2.762 1.166 2.95.143.19 2.013 3.074 4.877 4.31.681.294 1.213.47 1.627.601.684.218 1.307.187 1.8.113.55-.082 1.647-.672 1.88-1.321.233-.65.233-1.206.162-1.321-.07-.116-.253-.186-.532-.326z" />
            </svg>
          </a>
        </>
      )}
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
