import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import QuestionCard from '../components/QuestionCard.jsx';
import TagFilter from '../components/TagFilter.jsx';

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  
  // Ask Question form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [qTags, setQTags] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const isLoggedIn = !!(localStorage.getItem('token') || localStorage.getItem('adminToken'));

  const loadTags = () => {
    api.get('/questions/tags')
      .then((res) => setTags(res.data))
      .catch((err) => console.error('Failed to load tags:', err));
  };

  const loadQuestions = () => {
    const params = activeTag ? { tag: activeTag } : {};
    api.get('/questions', { params })
      .then((res) => setQuestions(res.data))
      .catch((err) => console.error('Failed to load questions:', err));
  };

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [activeTag]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim() || !content.trim()) {
      setFormError('Title and content are required.');
      return;
    }

    try {
      const tagList = qTags.split(',').map((t) => t.trim()).filter(Boolean);
      await api.post('/questions', { title, content, tags: tagList });
      
      // Reset form
      setTitle('');
      setContent('');
      setQTags('');
      setShowForm(false);
      
      // Reload questions & tags
      loadQuestions();
      loadTags();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to post question');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      loadQuestions();
      loadTags();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete question');
    }
  };

  return (
    <div className="questions-page">
      <div className="post-header-top" style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Questions & Answers</h1>
        {isLoggedIn ? (
          <button 
            className="admin-btn edit-btn" 
            onClick={() => setShowForm(!showForm)}
            style={{ fontSize: '13px', padding: '6px 12px' }}
          >
            {showForm ? 'CANCEL' : 'ASK QUESTION'}
          </button>
        ) : (
          <span className="empty-state" style={{ fontSize: '12px' }}>
            <Link to="/login" style={{ color: 'inherit', fontWeight: 'bold' }}>Sign in</Link> to ask a question
          </span>
        )}
      </div>

      {showForm && isLoggedIn && (
        <form className="comment-form" onSubmit={handleAskQuestion} style={{ marginBottom: '32px' }}>
          <h3>ASK A QUESTION</h3>
          {formError && <p className="error">{formError}</p>}
          <input
            type="text"
            placeholder="What is your question?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%' }}
          />
          <textarea
            placeholder="Provide context or detail for your question..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            required
            style={{ width: '100%', resize: 'vertical' }}
          />
          <input
            type="text"
            placeholder="Tags, comma separated (e.g. math, science, geography)"
            value={qTags}
            onChange={(e) => setQTags(e.target.value)}
            style={{ width: '100%' }}
          />
          <button type="submit">SUBMIT QUESTION</button>
        </form>
      )}

      <TagFilter tags={tags} activeTag={activeTag} onSelect={setActiveTag} />

      {questions.length === 0 && (
        <p className="empty-state" style={{ marginTop: '20px' }}>
          No questions yet. Be the first to ask!
        </p>
      )}

      <div className="post-list">
        {questions.map((question) => (
          <QuestionCard
            key={question._id}
            question={question}
            onDelete={handleDeleteQuestion}
          />
        ))}
      </div>
    </div>
  );
}

export default Questions;
