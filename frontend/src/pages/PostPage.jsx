import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import LikeButton from '../components/LikeButton.jsx';
import CommentSection from '../components/CommentSection.jsx';
import ContentRenderer from '../components/ContentRenderer.jsx';

// Set to track viewed posts in this session and prevent double-incrementing on mount (due to React StrictMode or double renders)
const viewedPostIds = new Set();

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

        // Increment views count once per mount/session of this post ID
        if (!viewedPostIds.has(id)) {
          viewedPostIds.add(id);
          api.post(`/posts/${id}/view`)
            .then((viewRes) => {
              // Update local state with the actual incremented views count
              setPost(prev => prev ? { ...prev, views: viewRes.data.views } : prev);
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


