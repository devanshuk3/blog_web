import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import LikeButton from '../components/LikeButton.jsx';
import CommentSection from '../components/CommentSection.jsx';

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
        <span className="date">{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      <LikeButton postId={post._id} initialLikes={post.likes} />
      <div className="post-content">{post.content}</div>
      <hr />
      <CommentSection postId={post._id} />
    </div>
  );
}

export default PostPage;


