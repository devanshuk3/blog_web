import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function AdminUpload() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState('');
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
      const res = await api.post('/posts', { title, content, tags: tagList, image });
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
      <div className="image-upload-container">
        <label className="image-upload-label">IMPORT FROM MARKDOWN (.MD) FILE</label>
        <input
          type="file"
          accept=".md,.markdown,text/markdown,text/plain"
          className="image-upload-input"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const text = event.target.result;
                const firstHeading = text.match(/^#\s+(.*)$/m);
                if (firstHeading && !title) {
                  setTitle(firstHeading[1].trim());
                } else if (!title) {
                  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                  setTitle(nameWithoutExt);
                }
                setContent(text);
              };
              reader.readAsText(file);
            }
          }}
        />
      </div>
      <textarea
        placeholder="Write your post (supports GitHub Flavored Markdown)..."
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
      <button type="submit">PUBLISH</button>
    </form>
  );
}

export default AdminUpload;

