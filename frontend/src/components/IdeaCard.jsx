import { Link } from 'react-router-dom';

function IdeaCard({ idea, onDelete }) {
  const date = new Date(idea.createdAt).toLocaleDateString();
  const snippet = idea.content.length > 160 ? idea.content.slice(0, 160) + '...' : idea.content;

  const loggedInUsername = localStorage.getItem('username');
  const isAdmin = !!localStorage.getItem('adminToken');
  const isOwnerOrAdmin = isAdmin || (loggedInUsername && loggedInUsername === idea.username);

  return (
    <div className="post-card">
      <Link to={`/idea/${idea._id}`} className="post-card-content">
        <div className="post-card-header">
          <h2>{idea.title}</h2>
        </div>
        <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 12px 0' }}>
          Proposed by: <strong>{idea.username}</strong>
        </p>
        <p>{snippet}</p>
      </Link>
      <div className="post-card-footer">
        <div className="tags-container">
          {idea.tags.map((tag) => (
            <span key={tag} className="tag">
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
              onClick={() => onDelete(idea._id)}
            >
              DELETE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default IdeaCard;
