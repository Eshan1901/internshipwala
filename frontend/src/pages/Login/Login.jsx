import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import { toast } from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(formData);
      toast.success(res.message || 'Successfully signed in!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your student account">
      <form onSubmit={handleSubmit} className="auth-form" id="login-form">
        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="email-input">Email Address</label>
          <div className="auth-input-group">
            <div className="auth-input-icon">
              <span className="material-symbols-outlined">mail</span>
            </div>
            <input
              id="email-input"
              type="email"
              name="email"
              required
              placeholder="name@college.edu"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <label className="form-label" htmlFor="password-input">Password</label>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem' }} id="forgot-password-link">
              Forgot?
            </Link>
          </div>
          <div className="auth-input-group">
            <div className="auth-input-icon">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="form-input has-toggle"
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <span className="material-symbols-outlined">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-block"
          style={{ marginTop: '1.5rem' }}
          id="login-btn"
        >
          {loading ? (
            <div className="spinner spinner-sm" />
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
              Sign In
            </>
          )}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" id="to-register-link" style={{ fontWeight: '600' }}>
            Create Account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
