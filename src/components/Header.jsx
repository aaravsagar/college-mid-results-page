import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

function Header() {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
              Mid-Semester Results Portal
            </h1>
            
            {currentUser && (
              <nav className="header-nav">
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </button>
                
                {isAdmin() && (
                  <button
                    onClick={() => navigate('/users')}
                    className={`nav-link ${isActive('/users') ? 'active' : ''}`}
                  >
                    User Management
                  </button>
                )}
                
                <button
                  onClick={() => navigate('/results')}
                  className={`nav-link ${location.pathname.startsWith('/results') ? 'active' : ''}`}
                >
                  Results
                </button>
              </nav>
            )}
          </div>

          {currentUser && (
            <div className="header-right">
              <div className="user-info">
                <div className="user-name">{currentUser.name}</div>
                <div className={`user-role ${currentUser.role}`}>
                  {currentUser.role}
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-small">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;