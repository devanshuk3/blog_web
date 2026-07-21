import { useState } from 'react';
import api from '../api';

function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(() => localStorage.getItem(`liked_${postId}`) === 'true');

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await api.post(`/posts/${postId}/like`);
      setLikes(res.data.likes);
      setLiked(true);
      localStorage.setItem(`liked_${postId}`, 'true');
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  return (
    <button className={`like-button ${liked ? 'liked' : ''}`} onClick={handleLike} disabled={liked}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{likes} {liked ? 'LIKED' : 'LIKE'}</span>
    </button>
  );
}

export default LikeButton;

