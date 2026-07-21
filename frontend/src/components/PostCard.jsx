import { Link } from 'react-router-dom';

function PostCard({ post, isAdmin, onDelete, onEdit }) {
  const date = new Date(post.createdAt).toLocaleDateString();
  const snippet = post.content.length > 160 ? post.content.slice(0, 160) + '...' : post.content;

  return (
    <div className="post-card">
      <Link to={`/post/${post._id}`} className="post-card-content">
        <div className="post-card-header">
          <h2>{post.title}</h2>
          <span className="likes-badge">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {post.likes}
          </span>
        </div>
        <p>{snippet}</p>
      </Link>
      <div className="post-card-footer">
        <div className="tags-container">
          {post.tags.map((tag) => (
            <span key={tag} className="tag">{tag.toUpperCase()}</span>
          ))}
        </div>
        <span className="date">{date}</span>
        {isAdmin && (
          <div className="admin-actions">
            <button type="button" className="admin-btn edit-btn" onClick={() => onEdit(post._id)}>EDIT</button>
            <button type="button" className="admin-btn delete-btn" onClick={() => onDelete(post._id)}>DELETE</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostCard;

