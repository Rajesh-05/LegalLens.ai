import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import appIcon from '../assets/app_image.png';
import './Auth.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  // Dummy credentials for testing
  const DUMMY_CREDENTIALS = {
    username: 'Rajesh-05',
    password: '123456'
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check dummy credentials first
      if (formData.username === DUMMY_CREDENTIALS.username && formData.password === DUMMY_CREDENTIALS.password) {
        // Dummy login success
        const userData = {
          username: formData.username,
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com'
        };
        
        login(userData);
        navigate('/dashboard');
        return;
      }

      // If not dummy credentials, try actual backend
      const response = await fetch('http://localhost:3500/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Backend login success
        login(data.user || { username: formData.username });
        navigate('/dashboard');
      } else {
        // setError(data.message || 'Invalid credentials. Try username: Rajesh-05, password: 123456');
        setError(data.message || 'Invalid credentials.');
      }
    } catch (err) {
      // If network error, still allow dummy login
      if (formData.username === DUMMY_CREDENTIALS.username && formData.password === DUMMY_CREDENTIALS.password) {
        const userData = {
          username: formData.username,
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          user_id: 'dummy_user_123' // Add dummy user_id for testing
        };
        
        login(userData);
        navigate('/dashboard');
      } else {
        setError('Network error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-brand">
          {/* <Link to="/" className="brand-link"> */}
            <img 
              src={appIcon} 
              alt="TaxFlow.ai" 
              style={{
                width: '280px',
                height: '280px',
                marginLeft:'-10px',
                marginBottom: '1rem',
                borderRadius: '32px'
              }}
            />
            {/* <h2>TaxFlow.ai</h2> */}
          {/* </Link> */}
          <p>Welcome back! Sign in to your account</p>
        </div>

        <div className="auth-form-container">
          <div className="auth-card">
            <h3>Sign In</h3>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account? 
                <Link to="/signup" className="auth-link"> Sign up here</Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignIn;