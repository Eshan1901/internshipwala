import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Courses from './pages/Courses/Courses';
import CourseDetail from './pages/CourseDetail/CourseDetail';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import VerifyOtp from './pages/VerifyOtp/VerifyOtp';
import Dashboard from './pages/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();

  // Hide Navbar/Footer on Auth screens
  const isAuthRoute = ['/login', '/register', '/verify-otp'].includes(location.pathname);

  return (
    <>
      {!isAuthRoute && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isAuthRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
