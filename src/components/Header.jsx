import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { user, logout, isAuthenticated } = useAuth();

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleLogout = () => {
    logout();
    setActiveDropdown(null);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <h2>TaxFlow.ai</h2>
          </Link>
        </div>
        
        <nav className="nav-menu">
          <div className="nav-item dropdown">
            <button 
              className="nav-link"
              onClick={() => toggleDropdown('products')}
            >
              Products
              <span className="dropdown-arrow">▼</span>
            </button>
            {activeDropdown === 'products' && (
              <div className="dropdown-menu">
                <a href="#itr-classifier" className="dropdown-item">ITR Classifier</a>
                <a href="#regime-selector" className="dropdown-item">Regime Selector</a>
                <a href="#automated-filing" className="dropdown-item">Automated Filing</a>
                <a href="#chat-assistant" className="dropdown-item">Smart Chat Assistant</a>
                <a href="#tax-savings" className="dropdown-item">Tax Savings AI</a>
              </div>
            )}
          </div>

          <div className="nav-item dropdown">
            <button 
              className="nav-link"
              onClick={() => toggleDropdown('contact')}
            >
              Contact Us
              <span className="dropdown-arrow">▼</span>
            </button>
            {activeDropdown === 'contact' && (
              <div className="dropdown-menu">
                <a href="#support" className="dropdown-item">Support</a>
                <a href="#sales" className="dropdown-item">Sales</a>
                <a href="#partnerships" className="dropdown-item">Partnerships</a>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="nav-item dropdown">
              <button 
                className="nav-link user-menu"
                onClick={() => toggleDropdown('user')}
              >
                <div className="user-info">
                  <div className="user-avatar">
                    <span>👤</span>
                  </div>
                  <span className="user-name">{user.name || user.username}</span>
                </div>
                <span className="dropdown-arrow">▼</span>
              </button>
              {activeDropdown === 'user' && (
                <div className="dropdown-menu">
                  <a href="#profile" className="dropdown-item">Profile</a>
                  <a href="#settings" className="dropdown-item">Settings</a>
                  <a href="#billing" className="dropdown-item">Billing</a>
                  <hr className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/signin" className="nav-link login-btn">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;