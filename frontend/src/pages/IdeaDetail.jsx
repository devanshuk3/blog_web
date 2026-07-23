import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [idea, setIdea] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Suggestion form state
  const loggedInUsername = localStorage.getItem('username') || '';
  const [username, setUsername] = useState(loggedInUsername || localStorage.getItem('commentUsername') || '');
  const [text, setText] = useState('');

  const isAdmin = !!localStorage.getItem('adminToken');

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  const startEditing = () => {
    setEditTitle(idea.title);
    setEditContent(idea.content);
    setEditTags(idea.tags ? idea.tags.join(', ') : '');
    setIsEditing(true);
  };

  const handleUpdateIdea = async (e) => {
    e.preventDefault();
    try {
      const tagList = editTags.split(',').map((t) => t.trim()).filter(Boolean);
      const res = await api.put(`/ideas/${id}`, {
        title: editTitle,
        content: editContent,
        tags: tagList
      });
      setIdea(res.data);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update idea');
    }
  };

  const loadIdea = async () => {
    try {
      const res = await api.get(`/ideas/${id}`);
      setIdea(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load idea');
    }
  };

  const loadSuggestions = async () => {
    try {
      const res = await api.get(`/ideas/${id}/suggestions`);
      setSuggestions(res.data);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadIdea(), loadSuggestions()]).finally(() => {
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (loggedInUsername) {
      setUsername(loggedInUsername);
    }
  }, [loggedInUsername]);

  const handlePostSuggestion = async (e) => {
    e.preventDefault();
    if (!username.trim() || !text.trim()) return;

    try {
      if (!loggedInUsername) {
        localStorage.setItem('commentUsername', username);
      }
      await api.post(`/ideas/${id}/suggestions`, { username, text });
      setText('');
      loadSuggestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post suggestion');
    }
  };

  const handleDeleteSuggestion = async (suggestionId) => {
    if (!window.confirm('Are you sure you want to delete this suggestion?')) return;
    try {
      await api.delete(`/ideas/${id}/suggestions/${suggestionId}`);
      loadSuggestions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete suggestion');
    }
  };

  const handleDeleteIdea = async () => {
    if (!window.confirm('Are you sure you want to delete this idea?')) return;
    try {
      await api.delete(`/ideas/${id}`);
      navigate('/ideas');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete idea');
    }
  };

  if (loading) {
    return (
      <div className="post-page">
        <p className="empty-state">Loading idea...</p>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="post-page">
        <Link to="/ideas" className="back-link">← BACK TO IDEAS</Link>
        <p className="error" style={{ marginTop: '20px' }}>{error || 'Idea not found'}</p>
      </div>
    );
  }

  const isIdeaOwner = loggedInUsername && loggedInUsername === idea.username;
  const isIdeaOwnerOrAdmin = isAdmin || isIdeaOwner;

  return (
    <div className="post-page">
      <div className="post-header-top">
        <Link to="/ideas" className="back-link">← BACK TO IDEAS</Link>
        {isIdeaOwnerOrAdmin && !isEditing && (
          <div className="admin-actions">
            <button className="admin-btn edit-btn" style={{ marginRight: '8px' }} onClick={startEditing}>
              EDIT IDEA
            </button>
            <button className="admin-btn delete-btn" onClick={handleDeleteIdea}>
              DELETE IDEA
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form className="admin-form" onSubmit={handleUpdateIdea} style={{ marginTop: '20px', maxWidth: '100%' }}>
          <h2>EDIT IDEA</h2>
          <input
            type="text"
            placeholder="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Write your idea..."
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={12}
            required
          />
          <input
            type="text"
            placeholder="Tags, comma separated (e.g. design, community)"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
          />
          <div className="form-actions">
            <button type="submit">SAVE CHANGES</button>
            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>CANCEL</button>
          </div>
        </form>
      ) : (
        <>
          <h1>{idea.title}</h1>

          <div className="post-meta">
            <span style={{ fontSize: '13px', color: '#666' }}>
              Proposed by: <strong>{idea.username}</strong>
            </span>
            {idea.tags && idea.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag.toUpperCase()}
              </span>
            ))}
            <span className="date">{new Date(idea.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="post-content" style={{ whiteSpace: 'pre-wrap' }}>{idea.content}</div>
        </>
      )}

      <hr />

      <div className="comment-section">
        <h3>{suggestions.length} SUGGESTIONS</h3>

        {suggestions.length === 0 && (
          <p className="empty-state">No suggestions yet. Share your thoughts or feedback!</p>
        )}

        <div className="comment-list">
          {suggestions.map((sug) => {
            const isSuggestionAuthorOrAdmin = isAdmin || (loggedInUsername && loggedInUsername === sug.username);
            return (
              <div key={sug._id} className="comment">
                <div className="comment-header">
                  <strong>{sug.username}</strong>
                  <span className="date">{new Date(sug.createdAt).toLocaleString()}</span>
                </div>
                <p>{sug.text}</p>
                <div className="comment-actions">
                  {isSuggestionAuthorOrAdmin && (
                    <button
                      type="button"
                      className="admin-btn delete-btn"
                      style={{ fontSize: '10px' }}
                      onClick={() => handleDeleteSuggestion(sug._id)}
                    >
                      DELETE
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <form className="comment-form" onSubmit={handlePostSuggestion}>
          <label>YOUR SUGGESTION</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Provide feedback, ideas or recommendations for this idea..."
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
          <button type="submit">POST SUGGESTION</button>
        </form>
      </div>
    </div>
  );
}

export default IdeaDetail;
