import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import LikeButton from '../components/LikeButton.jsx';
import CommentSection from '../components/CommentSection.jsx';
import ContentRenderer from '../components/ContentRenderer.jsx';

// Track HMR reloads in dev mode so hot updates can refresh view counts if reloaded
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    sessionStorage.setItem('vite_hmr_reload', 'true');
  });
}

function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isAdmin = !!localStorage.getItem('adminToken');

  useEffect(() => {
    setLoading(true);
    api.get(`/posts/${id}`)
      .then((res) => {
        setPost(res.data);
        setError(null);

        const viewedKey = `blog_viewed_${id}`;
        const hasViewed = localStorage.getItem(viewedKey);
        const isHmrReload = sessionStorage.getItem('vite_hmr_reload') === 'true';

        // Increment views ONLY IF:
        // 1. A new user/browser visits the post for the first time
        // OR
        // 2. The app is hot-reloaded during development (HMR)
        // Normal page refreshes (F5) will NOT increment the view count.
        if (!hasViewed || isHmrReload) {
          if (isHmrReload) {
            sessionStorage.removeItem('vite_hmr_reload');
          }
          localStorage.setItem(viewedKey, 'true');

          api.post(`/posts/${id}/view`)
            .then((viewRes) => {
              setPost((prev) => (prev ? { ...prev, views: viewRes.data.views } : prev));
            })
            .catch((e) => console.error('Failed to increment view count', e));
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load post');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  if (loading) return <div className="post-page"><p className="empty-state">Loading post...</p></div>;
  if (error || !post) return (
    <div className="post-page">
      <Link to="/" className="back-link">← BACK</Link>
      <p className="error" style={{ marginTop: '20px' }}>{error || 'Post not found'}</p>
    </div>
  );

  return (
    <div className="post-page">
      <div className="post-header-top">
        <Link to="/" className="back-link">← BACK</Link>
        {isAdmin && (
          <div className="admin-actions">
            <button className="admin-btn edit-btn" onClick={() => navigate(`/admin/edit/${id}`)}>EDIT POST</button>
            <button className="admin-btn delete-btn" onClick={handleDelete}>DELETE POST</button>
          </div>
        )}
      </div>
      <h1>{post.title}</h1>
      <div className="post-meta">
        {post.tags && post.tags.map((tag) => (
          <span key={tag} className="tag">{tag.toUpperCase()}</span>
        ))}
        <span className="views-badge" style={{ fontSize: '11px', padding: '3px 8px' }}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {post.views || 0} VIEWS
        </span>
        <span className="date">{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      <LikeButton postId={post._id} initialLikes={post.likes} />
      <div className="post-content">
        {post.image && (
          <img
            src={post.image}
            alt="Attached"
            className="attached-image"
          />
        )}
        <ContentRenderer content={post.content} />
      </div>
      <hr />
      <CommentSection postId={post._id} />
    </div>
  );
}

export default PostPage;


