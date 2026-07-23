import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import IdeaCard from '../components/IdeaCard.jsx';
import TagFilter from '../components/TagFilter.jsx';

function Ideas() {
  const [ideas, setIdeas] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  
  // Submit Idea form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [iTags, setITags] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const isLoggedIn = !!(localStorage.getItem('token') || localStorage.getItem('adminToken'));

  const loadTags = () => {
    api.get('/ideas/tags')
      .then((res) => setTags(res.data))
      .catch((err) => console.error('Failed to load tags:', err));
  };

  const loadIdeas = () => {
    const params = activeTag ? { tag: activeTag } : {};
    api.get('/ideas', { params })
      .then((res) => setIdeas(res.data))
      .catch((err) => console.error('Failed to load ideas:', err));
  };

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    loadIdeas();
  }, [activeTag]);

  const handlePostIdea = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim() || !content.trim()) {
      setFormError('Title and content are required.');
      return;
    }

    try {
      const tagList = iTags.split(',').map((t) => t.trim()).filter(Boolean);
      await api.post('/ideas', { title, content, tags: tagList });
      
      // Reset form
      setTitle('');
      setContent('');
      setITags('');
      setShowForm(false);
      
      // Reload ideas & tags
      loadIdeas();
      loadTags();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post idea');
    }
  };

  const handleDeleteIdea = async (id) => {
    if (!window.confirm('Are you sure you want to delete this idea?')) return;
    try {
      await api.delete(`/ideas/${id}`);
      loadIdeas();
      loadTags();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete idea');
    }
  };

  return (
    <div className="ideas-page">
      <div className="post-header-top" style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Project Ideas</h1>
        {isLoggedIn ? (
          <button 
            className="admin-btn edit-btn" 
            onClick={() => setShowForm(!showForm)}
            style={{ fontSize: '13px', padding: '6px 12px' }}
          >
            {showForm ? 'CANCEL' : 'SHARE AN IDEA'}
          </button>
        ) : (
          <span className="empty-state" style={{ fontSize: '12px' }}>
            <Link to="/login" style={{ color: 'inherit', fontWeight: 'bold' }}>Sign in</Link> to share an idea
          </span>
        )}
      </div>

      {showForm && isLoggedIn && (
        <form className="comment-form" onSubmit={handlePostIdea} style={{ marginBottom: '32px' }}>
          <h3>SHARE A NEW IDEA</h3>
          {formError && <p className="error">{formError}</p>}
          <input
            type="text"
            placeholder="What is your project idea?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%' }}
          />
          <textarea
            placeholder="Describe your project idea in detail, what you want to work on, tech stack etc..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            required
            style={{ width: '100%', resize: 'vertical' }}
          />
          <input
            type="text"
            placeholder="Tags, comma separated (e.g. web, web3, app, python)"
            value={iTags}
            onChange={(e) => setITags(e.target.value)}
            style={{ width: '100%' }}
          />
          <button type="submit">SUBMIT IDEA</button>
        </form>
      )}

      <TagFilter tags={tags} activeTag={activeTag} onSelect={setActiveTag} />

      {ideas.length === 0 && (
        <p className="empty-state" style={{ marginTop: '20px' }}>
          No ideas posted yet. Be the first to share one!
        </p>
      )}

      <div className="post-list">
        {ideas.map((idea) => (
          <IdeaCard
            key={idea._id}
            idea={idea}
            onDelete={handleDeleteIdea}
          />
        ))}
      </div>
    </div>
  );
}

export default Ideas;
