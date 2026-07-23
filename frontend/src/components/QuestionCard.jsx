import { Link } from 'react-router-dom';

function QuestionCard({ question, onDelete }) {
  const date = new Date(question.createdAt).toLocaleDateString();
  const snippet = question.content.length > 160 ? question.content.slice(0, 160) + '...' : question.content;

  const loggedInUsername = localStorage.getItem('username');
  const isAdmin = !!localStorage.getItem('adminToken');
  const isOwnerOrAdmin = isAdmin || (loggedInUsername && loggedInUsername === question.username);

  return (
    <div className="post-card">
      <Link to={`/question/${question._id}`} className="post-card-content">
        <div className="post-card-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {question.title}
            {question.isAnswered && (
              <span className="user-role-badge" style={{ backgroundColor: '#e2f0d9', borderColor: '#385723', color: '#385723' }}>
                ANSWERED
              </span>
            )}
          </h2>
        </div>
        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 12px 0' }}>
          Asked by: <strong>{question.username}</strong>
        </p>
        <p>{snippet}</p>
      </Link>
      <div className="post-card-footer">
        <div className="tags-container">
          {question.tags.map((tag) => (
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
        </div>
        <span className="date">{date}</span>
        {isOwnerOrAdmin && (
          <div className="admin-actions">
            <button
              type="button"
              className="admin-btn delete-btn"
              onClick={() => onDelete(question._id)}
            >
              DELETE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionCard;
