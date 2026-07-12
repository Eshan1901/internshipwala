import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import authService from '../../services/authService';
import { toast } from 'react-hot-toast';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email.');
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

        {sent ? (
          <div className="success-state">
            <div className="success-icon-circle">
              <CheckCircle size={48} />
            </div>
            <h2>Check Your Email</h2>
            <p>
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
            <Link to="/login" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <h1>Forgot Password</h1>
              <p>Enter your registered email and we'll send you a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">
                  <Mail size={16} /> Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block"
                id="forgot-password-btn"
              >
                {loading ? <div className="spinner spinner-sm" /> : 'Send Reset Link'}
              </button>
            </form>

            <p className="auth-footer-link">
              <Link to="/login"><ArrowLeft size={14} /> Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
