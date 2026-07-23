import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  const role = localStorage.getItem('userRole') || (localStorage.getItem('adminToken') ? 'admin' : null);
  const username = localStorage.getItem('username');

  const isAdmin = role === 'admin';

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand" onClick={() => setIsOpen(false)}>Devanshu Kumar</Link>
      
      <button 
        type="button" 
        className="hamburger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <span className={`bar ${isOpen ? 'open' : ''}`}></span>
        <span className={`bar ${isOpen ? 'open' : ''}`}></span>
        <span className={`bar ${isOpen ? 'open' : ''}`}></span>
      </button>

      <div className={`nav-links ${isOpen ? 'open' : ''}`}>
        {token ? (
          <>
            <span className="user-role-badge">
              {isAdmin ? `Admin${username ? ` (${username})` : ''}` : username}
            </span>
            <Link to="/questions" onClick={() => setIsOpen(false)}>QUESTIONS</Link>
            <Link to="/ideas" onClick={() => setIsOpen(false)}>IDEAS</Link>
            {isAdmin && <Link to="/admin/new" onClick={() => setIsOpen(false)}>NEW POST</Link>}
            <button type="button" onClick={logout}>SIGN OUT</button>
          </>
        ) : (
          <Link to="/login" onClick={() => setIsOpen(false)}>SIGN IN</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
