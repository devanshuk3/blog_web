import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
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
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Devanshu Kumar</Link>
      <div className="nav-links">
        {token ? (
          <>
            <span className="user-role-badge">
              {isAdmin ? `Admin${username ? ` (${username})` : ''}` : username}
            </span>
            {isAdmin && <Link to="/admin/new">NEW POST</Link>}
            <button type="button" onClick={logout}>SIGN OUT</button>
          </>
        ) : (
          <Link to="/login">SIGN IN</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
