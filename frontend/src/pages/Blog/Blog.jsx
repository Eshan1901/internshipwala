import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Tag, ChevronRight, Search } from 'lucide-react';
import blogService from '../../services/blogService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-hot-toast';
import './Blog.css';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    blogService.listCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const params = { page, limit: 9 };
        if (search) params.search = search;
        if (categoryId) params.category_id = categoryId;
        const res = await blogService.listPosts(params);
        setPosts(res.data || []);
        setMeta(res.meta || null);
      } catch (err) {
        toast.error(err.message || 'Failed to load blog posts.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [page, categoryId]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const readTime = (content) => {
    if (!content) return '3 min read';
    const words = content.split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 200))} min read`;
  };

  return (
    <div className="blog-page section">
      <div className="container">
        <div className="blog-hero animate-fade-in">
          <h1 className="page-title">InternshipWala <span className="gradient-text">Blog</span></h1>
          <p className="page-subtitle">Career advice, tech insights, and success stories from our mentors and alumni.</p>
        </div>

        {/* Controls */}
        <div className="blog-controls glass-card animate-fade-in">
          <form onSubmit={handleSearch} className="search-row">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search articles..."
                className="form-input search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="blog-search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary" id="blog-search-btn">Search</button>
          </form>

          {categories.length > 0 && (
            <div className="filter-row">
              <Tag size={15} />
              <span className="filter-label">Category:</span>
              <button
                className={`filter-chip ${categoryId === '' ? 'active' : ''}`}
                onClick={() => { setCategoryId(''); setPage(1); }}
              >All</button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`filter-chip ${categoryId === cat.id ? 'active' : ''}`}
                  onClick={() => { setCategoryId(cat.id); setPage(1); }}
                  id={`cat-${cat.id}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : posts.length === 0 ? (
          <div className="empty-state glass-card">
            <BookOpen size={48} className="empty-icon" />
            <h3>No Articles Found</h3>
            <p>Try a different search term or category.</p>
          </div>
        ) : (
          <>
            <div className="blog-grid">
              {posts.map((post, i) => (
                <Link
                  to={`/blog/${post.slug}`}
                  key={post.id}
                  className="blog-card glass-card animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                  id={`blog-post-${post.id}`}
                >
                  <div className="blog-card-body">
                    {post.category && (
                      <span className="blog-category-tag" style={{ background: `${post.category.colour_code}20`, color: post.category.colour_code }}>
                        {post.category.name}
                      </span>
                    )}
                    <h2 className="blog-card-title">{post.title}</h2>
                    {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
                  </div>
                  <div className="blog-card-footer">
                    <div className="blog-meta">
                      <Clock size={13} />
                      <span>{readTime(post.content)}</span>
                      {post.published_at && (
                        <span>· {new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      )}
                    </div>
                    <span className="blog-read-link">Read more <ChevronRight size={14} /></span>
                  </div>
                </Link>
              ))}
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="pagination-row">
                <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} id="prev-blog-page">Previous</button>
                <span className="page-indicator">Page {meta.page} of {meta.totalPages}</span>
                <button className="btn btn-outline btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)} id="next-blog-page">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
