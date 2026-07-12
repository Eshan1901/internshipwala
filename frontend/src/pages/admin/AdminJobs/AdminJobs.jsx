import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout/AdminLayout';
import adminService from '../../../services/adminService';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const EMPTY_FORM = { title: '', description: '', company_name: '', location: '', type: 'internship', stipend: '', duration: '', openings: 1, deadline: '' };

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async (p = page) => {
    try { setLoading(true);
      const res = await adminService.listJobs({ page: p, limit: 15 });
      setJobs(res.data || []); setMeta(res.meta || null);
    } catch (err) { toast.error(err.message || 'Failed to load jobs.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (job) => {
    setEditId(job.id);
    setForm({ title: job.title || '', description: job.description || '', company_name: job.company_name || '', location: job.location || '', type: job.type || 'internship', stipend: job.stipend || '', duration: job.duration || '', openings: job.openings || 1, deadline: job.deadline ? job.deadline.split('T')[0] : '' });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try { setSaving(true);
      const payload = { ...form, stipend: form.stipend ? Number(form.stipend) : undefined, openings: Number(form.openings) };
      if (editId) await adminService.updateJob(editId, payload);
      else await adminService.createJob(payload);
      toast.success(editId ? 'Job updated.' : 'Job created.');
      setShowForm(false); setForm(EMPTY_FORM); setEditId(null); load();
    } catch (err) { toast.error(err.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job listing?')) return;
    try { await adminService.deleteJob(id); toast.success('Job deleted.'); load(); }
    catch (err) { toast.error(err.message || 'Failed to delete.'); }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Jobs</h1>
          <p className="admin-page-subtitle">Manage job and internship listings for the platform.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY_FORM); }} id="add-job-btn">
          <Plus size={16} /> {showForm ? 'Cancel' : 'Add Job'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="glass-card" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {[['title','Job Title','text'],['company_name','Company','text'],['location','Location','text'],['stipend','Stipend (₹)','number'],['duration','Duration','text'],['openings','Openings','number'],['deadline','Deadline','date']].map(([name, label, type]) => (
            <div key={name} className="form-group">
              <label className="form-label">{label}</label>
              <input type={type} name={name} className="form-input" value={form[name]} onChange={handleChange} />
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Type</label>
            <select name="type" className="form-input" value={form.type} onChange={handleChange}>
              {['internship','full_time','part_time','contract'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Description</label>
            <textarea name="description" className="form-input" rows={4} style={{ resize: 'vertical' }} value={form.description} onChange={handleChange} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" id="save-job-btn">{saving ? <div className="spinner spinner-sm" /> : (editId ? 'Update Job' : 'Create Job')}</button>
          </div>
        </form>
      )}

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="glass-card admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Company</th><th>Type</th><th>Deadline</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>No jobs found.</td></tr>
                ) : jobs.map((j) => (
                  <tr key={j.id}>
                    <td style={{ fontWeight: 600 }}>{j.title}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{j.company_name || '—'}</td>
                    <td><span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{j.type}</span></td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{j.deadline ? new Date(j.deadline).toLocaleDateString('en-IN') : '—'}</td>
                    <td><span className={`badge ${j.deleted_at ? 'badge-danger' : 'badge-success'}`}>{j.deleted_at ? 'Deleted' : 'Active'}</span></td>
                    <td style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="admin-action-btn admin-btn-neutral" onClick={() => handleEdit(j)} id={`edit-job-${j.id}`}><Edit2 size={13} /></button>
                      {!j.deleted_at && <button className="admin-action-btn admin-btn-reject" onClick={() => handleDelete(j.id)} id={`del-job-${j.id}`}><Trash2 size={13} /></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="admin-pagination">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p-1)}>Prev</button>
              <span>Page {meta.page} of {meta.totalPages}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p+1)}>Next</button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
