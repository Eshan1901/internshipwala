import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Tag, Calendar } from 'lucide-react';
import blogService from '../../services/blogService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { toast } from 'react-hot-toast';
import './BlogPost.css';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await blogService.getPost(slug);
        setPost(res.data);
      } catch {
        toast.error('Failed to load article.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const readTime = (content) => {
    if (!content) return '3 min read';
    const words = content.split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 200))} min read`;
  };

  if (loading) return <div className="section container" style={{ paddingTop: '7rem' }}><LoadingSpinner /></div>;
  if (!post) return <div className="section container" style={{ paddingTop: '7rem', color: 'var(--color-text-muted)' }}>Article not found.</div>;

  return (
    <div className="blog-post-page section">
      <div className="container">
        <Link to="/blog" className="back-link"><ArrowLeft size={16} /> Back to Blog</Link>

        <article className="blog-post-container glass-card animate-fade-in">
          {/* Header */}
          <header className="blog-post-header">
            {post.category && (
              <span
                className="blog-post-category"
                style={{ background: `${post.category.colour_code}20`, color: post.category.colour_code }}
              >
                <Tag size={12} /> {post.category.name}
              </span>
            )}
            <h1 className="blog-post-title">{post.title}</h1>
            <div className="blog-post-meta">
              {post.published_at && (
                <span><Calendar size={14} /> {new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              )}
              <span><Clock size={14} /> {readTime(post.content)}</span>
            </div>
          </header>

          {/* Body */}
          <div className="blog-post-body">
            {post.content
              ? post.content.split('\n').map((para, i) =>
                  para.trim() ? <p key={i}>{para}</p> : <br key={i} />
                )
              : <p style={{ color: 'var(--color-text-muted)' }}>No content available.</p>
            }
          </div>
        </article>

        <div className="blog-post-back-row">
          <Link to="/blog" className="btn btn-outline">
            <ArrowLeft size={15} /> More Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
