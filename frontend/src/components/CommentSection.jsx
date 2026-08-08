import { useEffect, useState } from 'react';
import api from '../api';

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const loggedInUsername = localStorage.getItem('username') || '';
  const [username, setUsername] = useState(loggedInUsername || localStorage.getItem('commentUsername') || '');
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  const role = localStorage.getItem('userRole') || (localStorage.getItem('adminToken') ? 'admin' : null);
  const isAdmin = role === 'admin';

  useEffect(() => {
    loadComments();
  }, [postId]);

  useEffect(() => {
    if (loggedInUsername) {
      setUsername(loggedInUsername);
    }
  }, [loggedInUsername]);

  const loadComments = async () => {
    try {
      const res = await api.get(`/comments/${postId}`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !text.trim()) return;

    try {
      if (!loggedInUsername) {
        localStorage.setItem('commentUsername', username);
      }
      await api.post(`/comments/${postId}`, { username, text, replyTo });
      setText('');
      setReplyTo(null);
      loadComments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      loadComments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await api.post(`/comments/${commentId}/like`);
      loadComments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle comment like');
    }
  };

  return (
    <div className="comment-section">
      <h3>{comments.length} COMMENTS</h3>

      {comments.length === 0 && <p className="empty-state">No comments yet. Start the conversation.</p>}

      <div className="comment-list">
        {comments.map((c) => (
          <div key={c._id} className={`comment ${c.isLiked ? 'liked-comment' : ''}`}>
            {c.replyTo && <span className="reply-tag">replying to {c.replyTo}</span>}
            <div className="comment-header">
              <strong>{c.username}</strong>
              {c.isLiked && (
                <span
                  className="likes-badge"
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    marginLeft: '8px',
                    borderRadius: '2px',
                    letterSpacing: '0.05em'
                  }}
                >
                  ♥ LIKED BY AUTHOR
                </span>
              )}
              <span className="date">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <p>{c.text}</p>
            <div className="comment-actions">
              <button className="reply-link" onClick={() => setReplyTo(c.username)}>
                REPLY
              </button>
              {isAdmin && (
                <>
                  <button
                    type="button"
                    className="admin-btn"
                    style={{
                      marginLeft: '12px',
                      fontSize: '10px',
                      borderColor: c.isLiked ? 'var(--primary)' : 'var(--border)',
                      color: c.isLiked ? 'var(--primary)' : 'var(--text)',
                      fontWeight: '700'
                    }}
                    onClick={() => handleLikeComment(c._id)}
                  >
                    {c.isLiked ? 'UNLIKE' : 'LIKE'}
                  </button>
                  <button
                    type="button"
                    className="admin-btn delete-btn"
                    style={{ marginLeft: '8px', fontSize: '10px' }}
                    onClick={() => handleDeleteComment(c._id)}
                  >
                    DELETE
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <label>YOUR ANSWER</label>
        {replyTo && (
          <div className="replying-banner">
            Replying to {replyTo}
            <button type="button" onClick={() => setReplyTo(null)}>cancel</button>
          </div>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          required
        />
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your name"
          readOnly={!!loggedInUsername}
          required
        />
        <button type="submit">POST COMMENT</button>
      </form>
    </div>
  );
}

export default CommentSection;
