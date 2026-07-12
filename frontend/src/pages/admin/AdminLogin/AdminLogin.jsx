import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { toast } from 'react-hot-toast';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await adminLogin(form);
      toast.success('Welcome to Admin Panel!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card glass-card animate-fade-in">
        <div className="admin-login-header">
          <div className="admin-badge">
            <Shield size={28} />
          </div>
          <h1>Admin Portal</h1>
          <p>InternshipWala — Administration Access</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email"><Mail size={15} /> Email Address</label>
            <input
              id="admin-email"
              type="email"
              name="email"
              required
              placeholder="admin@internshipwala.com"
              className="form-input"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password"><Lock size={15} /> Password</label>
            <input
              id="admin-password"
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="form-input"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
            id="admin-login-btn"
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? <div className="spinner spinner-sm" /> : 'Sign In to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
