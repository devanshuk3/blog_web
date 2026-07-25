import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

function AdminEdit() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('');
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
        setImage(res.data.image || '');
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
      await api.put(`/posts/${id}`, { title, content, tags: tagList, image });
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
      <div className="image-upload-container">
        <label className="image-upload-label">ATTACH IMAGE (MAX 1MB)</label>
        <input
          type="file"
          accept="image/*"
          className="image-upload-input"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              if (file.size > 1024 * 1024) {
                alert("Image must be less than 1 MB");
                e.target.value = null;
                return;
              }
              const reader = new FileReader();
              reader.onloadend = () => {
                setImage(reader.result);
              };
              reader.readAsDataURL(file);
            }
          }}
        />
        {image && (
          <div className="image-preview-container">
            <img src={image} alt="Preview" className="image-preview" />
            <button
              type="button"
              className="remove-image-btn"
              onClick={() => setImage('')}
            >
              ✕
            </button>
          </div>
        )}
      </div>
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
