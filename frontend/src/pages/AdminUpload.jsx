import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function AdminUpload() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login');
    }
  }, [navigate]);

  if (!localStorage.getItem('adminToken')) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      const res = await api.post('/posts', { title, content, tags: tagList });
      navigate(`/post/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create post. Make sure you are logged in.');
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h1>NEW POST</h1>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Write your post..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={12}
        required
      />
      <input
        type="text"
        placeholder="Tags, comma separated (e.g. technical, life)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <button type="submit">PUBLISH</button>
    </form>
  );
}

export default AdminUpload;

