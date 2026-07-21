import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

function AdminEdit() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin/login');
      return;
    }

    api.get(`/posts/${id}`)
      .then((res) => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setTags(res.data.tags ? res.data.tags.join(', ') : '');
        setError('');
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load post for editing');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, navigate]);

  if (!localStorage.getItem('adminToken')) return null;
  if (loading) return <div className="container"><p className="empty-state">Loading post details...</p></div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      await api.put(`/posts/${id}`, { title, content, tags: tagList });
      navigate(`/post/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update post.');
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h1>EDIT POST</h1>
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
      <div className="form-actions">
        <button type="submit">SAVE CHANGES</button>
        <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>CANCEL</button>
      </div>
    </form>
  );
}

export default AdminEdit;
