import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout/AdminLayout';
import adminService from '../../../services/adminService';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const EMPTY_FORM = { title: '', slug: '', content: '', excerpt: '', category_id: '', is_published: false };

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async (p = page) => {
    try { setLoading(true);
      const res = await adminService.listBlogPosts({ page: p, limit: 15 });
      setPosts(res.data || []); setMeta(res.meta || null);
    } catch (err) { toast.error(err.message || 'Failed to load posts.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleEdit = (post) => {
    setEditId(post.id);
    setForm({ title: post.title || '', slug: post.slug || '', content: post.content || '', excerpt: post.excerpt || '', category_id: post.category_id || '', is_published: !!post.published_at });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try { setSaving(true);
      if (editId) await adminService.updateBlogPost(editId, form);
      else await adminService.createBlogPost(form);
      toast.success(editId ? 'Post updated.' : 'Post created.');
      setShowForm(false); setForm(EMPTY_FORM); setEditId(null); load();
    } catch (err) { toast.error(err.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try { await adminService.deleteBlogPost(id); toast.success('Post deleted.'); load(); }
    catch (err) { toast.error(err.message || 'Failed to delete.'); }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Blog</h1>
          <p className="admin-page-subtitle">Create and manage blog posts and articles.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(EMPTY_FORM); }} id="add-post-btn">
          <Plus size={16} /> {showForm ? 'Cancel' : 'New Post'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="glass-card" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Title</label><input name="title" className="form-input" value={form.title} onChange={handleChange} required /></div>
            <div className="form-group"><label className="form-label">Slug (auto if blank)</label><input name="slug" className="form-input" value={form.slug} onChange={handleChange} placeholder="my-post-slug" /></div>
            <div className="form-group"><label className="form-label">Excerpt</label><input name="excerpt" className="form-input" value={form.excerpt} onChange={handleChange} /></div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.5rem' }}>
              <input type="checkbox" id="is_published" name="is_published" checked={form.is_published} onChange={handleChange} style={{ width: 'auto' }} />
              <label htmlFor="is_published" className="form-label" style={{ margin: 0 }}>Publish immediately</label>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Content</label><textarea name="content" className="form-input" rows={8} style={{ resize: 'vertical' }} value={form.content} onChange={handleChange} /></div>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }} id="save-post-btn">{saving ? <div className="spinner spinner-sm" /> : (editId ? 'Update Post' : 'Create Post')}</button>
        </form>
      )}

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="glass-card admin-table-wrapper">
            <table className="admin-table">
              <thead><tr><th>Title</th><th>Slug</th><th>Published</th><th>Actions</th></tr></thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>No posts found.</td></tr>
                ) : posts.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{p.slug}</td>
                    <td><span className={`badge ${p.published_at ? 'badge-success' : 'badge-accent'}`}>{p.published_at ? 'Published' : 'Draft'}</span></td>
                    <td style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="admin-action-btn admin-btn-neutral" onClick={() => handleEdit(p)} id={`edit-post-${p.id}`}><Edit2 size={13} /></button>
                      <button className="admin-action-btn admin-btn-reject" onClick={() => handleDelete(p.id)} id={`del-post-${p.id}`}><Trash2 size={13} /></button>
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
