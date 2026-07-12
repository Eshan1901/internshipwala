import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout/AdminLayout';
import adminService from '../../../services/adminService';
import { toast } from 'react-hot-toast';
import { Send } from 'lucide-react';

export default function AdminNotifications() {
  const [form, setForm] = useState({ user_id: '', title: '', message: '', type: 'general' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      const payload = { ...form };
      if (!payload.user_id) delete payload.user_id; // broadcast if empty
      await adminService.sendNotification(payload);
      toast.success('Notification sent!');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setForm({ user_id: '', title: '', message: '', type: 'general' });
    } catch (err) {
      toast.error(err.message || 'Failed to send notification.');
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="admin-page-title">Send Notification</h1>
      <p className="admin-page-subtitle">Send a notification to a specific student or broadcast to all users.</p>

      <div className="glass-card" style={{ maxWidth: '600px', padding: '2rem', borderRadius: '1rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">User ID (leave blank to broadcast)</label>
            <input name="user_id" className="form-input" placeholder="UUID of student (optional)" value={form.user_id} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Title</label>
            <input name="title" className="form-input" required placeholder="Notification title" value={form.title} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea name="message" className="form-input" required rows={5} style={{ resize: 'vertical' }} placeholder="Notification message..." value={form.message} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Type</label>
            <select name="type" className="form-input" value={form.type} onChange={handleChange}>
              <option value="general">General</option>
              <option value="enrollment">Enrollment</option>
              <option value="payment">Payment</option>
              <option value="certificate">Certificate</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>

          <button type="submit" disabled={sending} className="btn btn-primary" style={{ alignSelf: 'flex-start' }} id="send-notification-btn">
            {sending ? <div className="spinner spinner-sm" /> : <><Send size={15} /> Send Notification</>}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
