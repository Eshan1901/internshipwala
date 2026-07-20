import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import authService from '../../services/authService';
import { toast } from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    password: '',
    college_name: '',
    present_course: '',
    year_qualifying: '',
    state: '',
    referral_code: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Small manual check before sending
    if (formData.mobile.length !== 10 || !/^\d{10}$/.test(formData.mobile)) {
      toast.error('Mobile number must be exactly 10 digits.');
      return;
    }
    if (!/^\d{4}$/.test(formData.year_qualifying)) {
      toast.error('Qualifying year must be a 4-digit number (e.g. 2025).');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.register(formData);
      toast.success(res.message || 'OTP sent successfully to your email.');

      // Pass email & purpose in state to VerifyOtp page
      navigate('/verify-otp', {
        state: {
          email: formData.email,
          purpose: 'registration',
          course_id: searchParams.get('course_id'),
          duration_id: searchParams.get('duration_id'),
        },
      });
    } catch (err) {
      toast.error(err.message || 'Registration failed. Check input parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Get Started" subtitle="Create your InternshipWala student account">
      <form onSubmit={handleSubmit} className="auth-form" id="register-form">
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-full-name">Full Name</label>
          <div className="auth-input-group">
            <div className="auth-input-icon">
              <span className="material-symbols-outlined">person</span>
            </div>
            <input
              id="register-full-name"
              type="text"
              name="full_name"
              required
              placeholder="Jane Doe"
              value={formData.full_name}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-email">Email Address</label>
          <div className="auth-input-group">
            <div className="auth-input-icon">
              <span className="material-symbols-outlined">mail</span>
            </div>
            <input
              id="register-email"
              type="email"
              name="email"
              required
              placeholder="jane@college.edu"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Mobile & Password Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-mobile">Mobile Number</label>
            <div className="auth-input-group">
              <div className="auth-input-icon">
                <span className="material-symbols-outlined">phone_iphone</span>
              </div>
              <input
                id="register-mobile"
                type="text"
                name="mobile"
                required
                placeholder="9876543210"
                value={formData.mobile}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <div className="auth-input-group">
              <div className="auth-input-icon">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <input
                id="register-password"
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* College Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-college">College Name</label>
          <div className="auth-input-group">
            <div className="auth-input-icon">
              <span className="material-symbols-outlined">domain</span>
            </div>
            <input
              id="register-college"
              type="text"
              name="college_name"
              required
              placeholder="IIT Bombay"
              value={formData.college_name}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Course & Year Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-course">Present Course</label>
            <div className="auth-input-group">
              <div className="auth-input-icon">
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <input
                id="register-course"
                type="text"
                name="present_course"
                required
                placeholder="B.Tech CSE"
                value={formData.present_course}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="register-year">Graduation Year</label>
            <div className="auth-input-group">
              <div className="auth-input-icon">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <input
                id="register-year"
                type="text"
                name="year_qualifying"
                required
                placeholder="2026"
                value={formData.year_qualifying}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* State & Referral */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-state">State</label>
            <div className="auth-input-group">
              <div className="auth-input-icon">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <input
                id="register-state"
                type="text"
                name="state"
                required
                placeholder="Maharashtra"
                value={formData.state}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="register-referral">Referral Code (Optional)</label>
            <div className="auth-input-group">
              <div className="auth-input-icon">
                <span className="material-symbols-outlined">redeem</span>
              </div>
              <input
                id="register-referral"
                type="text"
                name="referral_code"
                placeholder="REF123"
                value={formData.referral_code}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-block"
          style={{ marginTop: '1rem' }}
          id="register-btn"
        >
          {loading ? (
            <div className="spinner spinner-sm" />
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
              Register Account
            </>
          )}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" id="to-login-link" style={{ fontWeight: '600' }}>
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
