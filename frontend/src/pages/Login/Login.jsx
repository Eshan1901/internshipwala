import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/AuthLayout/AuthLayout';
import { toast } from 'react-hot-toast';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

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

        {/* Password */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <label className="form-label" htmlFor="password-input">Password</label>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem' }} id="forgot-password-link">
              Forgot?
            </Link>
          </div>
          <input
            id="password-input"
            type="password"
            name="password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
          />
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
              <LogIn size={18} /> Sign In
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
