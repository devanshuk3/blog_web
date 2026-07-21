import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import PostCard from '../components/PostCard.jsx';
import TagFilter from '../components/TagFilter.jsx';

function Home() {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const navigate = useNavigate();
  const isAdmin = !!localStorage.getItem('adminToken');

  useEffect(() => {
    api.get('/posts/tags').then((res) => setTags(res.data));
  }, []);

  const loadPosts = () => {
    const params = activeTag ? { tag: activeTag } : {};
    api.get('/posts', { params }).then((res) => setPosts(res.data));
  };

  useEffect(() => {
    loadPosts();
  }, [activeTag]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      loadPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit/${id}`);
  };

  return (
    <div>
      <TagFilter tags={tags} activeTag={activeTag} onSelect={setActiveTag} />
      {posts.length === 0 && <p className="empty-state">No posts yet.</p>}
      <div className="post-list">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            isAdmin={isAdmin}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;

