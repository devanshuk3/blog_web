import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';

function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Answer form state
  const loggedInUsername = localStorage.getItem('username') || '';
  const [username, setUsername] = useState(loggedInUsername || localStorage.getItem('commentUsername') || '');
  const [text, setText] = useState('');

  const isAdmin = !!localStorage.getItem('adminToken');

  const loadQuestion = async () => {
    try {
      const res = await api.get(`/questions/${id}`);
      setQuestion(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load question');
    }
  };

  const loadAnswers = async () => {
    try {
      const res = await api.get(`/questions/${id}/answers`);
      setAnswers(res.data);
    } catch (err) {
      console.error('Failed to load answers:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadQuestion(), loadAnswers()]).finally(() => {
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (loggedInUsername) {
      setUsername(loggedInUsername);
    }
  }, [loggedInUsername]);

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!username.trim() || !text.trim()) return;

    try {
      if (!loggedInUsername) {
        localStorage.setItem('commentUsername', username);
      }
      await api.post(`/questions/${id}/answers`, { username, text });
      setText('');
      loadAnswers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post answer');
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    try {
      await api.delete(`/questions/${id}/answers/${answerId}`);
      loadAnswers();
      loadQuestion(); // Reload question to update answered tag if needed
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete answer');
    }
  };

  const handleToggleLikeAnswer = async (answerId) => {
    try {
      await api.post(`/questions/${id}/answers/${answerId}/like`);
      loadAnswers();
      loadQuestion(); // Reload question to update answered tag
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle selection');
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      navigate('/questions');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="post-page">
        <p className="empty-state">Loading question...</p>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="post-page">
        <Link to="/questions" className="back-link">← BACK TO QUESTIONS</Link>
        <p className="error" style={{ marginTop: '20px' }}>{error || 'Question not found'}</p>
      </div>
    );
  }

  const isQuestionOwner = loggedInUsername && loggedInUsername === question.username;
  const isQuestionOwnerOrAdmin = isAdmin || isQuestionOwner;

  return (
    <div className="post-page">
      <div className="post-header-top">
        <Link to="/questions" className="back-link">← BACK TO QUESTIONS</Link>
        {isQuestionOwnerOrAdmin && (
          <div className="admin-actions">
            <button className="admin-btn delete-btn" onClick={handleDeleteQuestion}>
              DELETE QUESTION
            </button>
          </div>
        )}
      </div>

      <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {question.title}
        {question.isAnswered && (
          <span className="user-role-badge" style={{ backgroundColor: '#e2f0d9', borderColor: '#385723', color: '#385723' }}>
            ANSWERED
          </span>
        )}
      </h1>

      <div className="post-meta">
        <span style={{ fontSize: '13px', color: '#666' }}>
          Asked by: <strong>{question.username}</strong>
        </span>
        {question.tags && question.tags.map((tag) => (
          <span
            key={tag}
            className="tag"
            style={
              tag.toLowerCase() === 'answered'
                ? { backgroundColor: '#e2f0d9', borderColor: '#385723', color: '#385723' }
                : {}
            }
          >
            {tag.toUpperCase()}
          </span>
        ))}
        <span className="date">{new Date(question.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="post-content">{question.content}</div>

      <hr />

      <div className="comment-section">
        <h3>{answers.length} ANSWERS</h3>

        {answers.length === 0 && (
          <p className="empty-state">No answers yet. Share your knowledge!</p>
        )}

        <div className="comment-list">
          {answers.map((ans) => {
            const isAnswerAuthorOrAdmin = isAdmin || (loggedInUsername && loggedInUsername === ans.username);
            return (
              <div
                key={ans._id}
                className="comment"
                style={
                  ans.isLiked
                    ? { border: '2px solid #385723', backgroundColor: '#f2f9f0' }
                    : {}
                }
              >
                <div className="comment-header">
                  <strong>{ans.username}</strong>
                  {ans.isLiked && (
                    <span
                      className="user-role-badge"
                      style={{
                        backgroundColor: '#e2f0d9',
                        borderColor: '#385723',
                        color: '#385723',
                        fontSize: '10px',
                        padding: '2px 6px',
                      }}
                    >
                      LIKED ANSWER
                    </span>
                  )}
                  <span className="date">{new Date(ans.createdAt).toLocaleString()}</span>
                </div>
                <p>{ans.text}</p>
                <div className="comment-actions">
                  {/* Select Answer toggler - only question owner or admin can click */}
                  {isQuestionOwnerOrAdmin && (
                    <button
                      type="button"
                      className="reply-link"
                      onClick={() => handleToggleLikeAnswer(ans._id)}
                      style={{ color: ans.isLiked ? '#c00000' : '#385723', textDecoration: 'underline' }}
                    >
                      {ans.isLiked ? 'DESELECT ANSWER' : 'SELECT ANSWER'}
                    </button>
                  )}
                  {isAnswerAuthorOrAdmin && (
                    <button
                      type="button"
                      className="admin-btn delete-btn"
                      style={{ marginLeft: '12px', fontSize: '10px' }}
                      onClick={() => handleDeleteAnswer(ans._id)}
                    >
                      DELETE
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <form className="comment-form" onSubmit={handlePostAnswer}>
          <label>YOUR ANSWER</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your answer..."
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
          <button type="submit">POST ANSWER</button>
        </form>
      </div>
    </div>
  );
}

export default QuestionDetail;
