import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Key, ArrowLeft } from 'lucide-react';
import authService from '../../services/authService';
import { toast } from 'react-hot-toast';
import '../ForgotPassword/ForgotPassword.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', otp: '', new_password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authService.resetPassword({
        email: form.email,
        otp: form.otp,
        new_password: form.new_password,
      });
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-full-page">
      <div className="auth-card glass-card animate-fade-in">
        <div className="auth-logo">
          <span className="logo-icon">IW</span>
          <span className="logo-text">InternshipWala</span>
        </div>

        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter the OTP sent to your email and choose a new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reset-email">
              <Mail size={16} /> Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              name="email"
              required
              placeholder="your@email.com"
              className="form-input"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reset-otp">
              <Key size={16} /> OTP Code
            </label>
            <input
              id="reset-otp"
              type="text"
              name="otp"
              required
              maxLength={6}
              placeholder="6-digit OTP"
              className="form-input"
              value={form.otp}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reset-new-password">
              <Lock size={16} /> New Password
            </label>
            <input
              id="reset-new-password"
              type="password"
              name="new_password"
              required
              placeholder="Min 8 characters"
              className="form-input"
              value={form.new_password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
            id="reset-password-btn"
          >
            {loading ? <div className="spinner spinner-sm" /> : 'Reset Password'}
          </button>
        </form>

        <p className="auth-footer-link">
          <Link to="/login"><ArrowLeft size={14} /> Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
