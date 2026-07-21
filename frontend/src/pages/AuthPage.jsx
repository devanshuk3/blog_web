import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';

    try {
      const res = await api.post(endpoint, { username, password });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('userRole', res.data.role);

      if (res.data.role === 'admin') {
        localStorage.setItem('adminToken', res.data.token);
        navigate('/admin/new');
      } else {
        localStorage.removeItem('adminToken');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => { setMode('login'); setError(''); }}
        >
          SIGN IN
        </button>
        <button
          type="button"
          className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
          onClick={() => { setMode('register'); setError(''); }}
        >
          SIGN UP
        </button>
      </div>

      <form className="admin-form auth-form" onSubmit={handleSubmit}>
        <h1>{mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}</h1>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'PROCESSING...' : mode === 'login' ? 'SIGN IN' : 'SIGN UP'}
        </button>
      </form>
    </div>
  );
}

export default AuthPage;
