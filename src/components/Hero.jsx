import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Hero.css';

const Hero = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Revolutionize Your Tax Filing with 
            <span className="highlight"> AI-Powered Automation</span>
          </h1>
          
          <p className="hero-description">
            TaxFlow.ai is your intelligent tax filing companion that leverages cutting-edge AI technology 
            to automate your entire tax process. From ITR classification to regime selection and smart 
            tax-saving suggestions, we make tax filing effortless and accurate.
          </p>
          
          <div className="hero-features">
            <div className="feature-badge">
              <span className="badge-icon">🤖</span>
              <span>AI-Powered</span>
            </div>
            <div className="feature-badge">
              <span className="badge-icon">⚡</span>
              <span>Automated Filing</span>
            </div>
            <div className="feature-badge">
              <span className="badge-icon">💰</span>
              <span>Tax Optimization</span>
            </div>
          </div>
          
          <div className="hero-cta">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="cta-primary">Complete Profile</Link>
                <Link to="/filing" className="cta-secondary">Start Filing</Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="cta-primary">Get Started Free</Link>
                <button className="cta-secondary">Watch Demo</button>
              </>
            )}
          </div>
          
          <div className="trust-indicators">
            <p className="trust-text">Trusted by 10,000+ individuals and 500+ CAs</p>
            <div className="trust-stats">
              <div className="stat">
                <span className="stat-number">95.9%</span>
                <span className="stat-label">Accuracy</span>
              </div>
              <div className="stat">
                <span className="stat-number">13 Min</span>
                <span className="stat-label">Avg. Filing Time</span>
              </div>
              <div className="stat">
                <span className="stat-number">₹50K+</span>
                <span className="stat-label">Avg. Tax Savings</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="visual-card">
            <div className="card-header">
              <div className="card-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="card-title">TaxFlow Dashboard</span>
            </div>
            <div className="card-content">
              <div className="progress-item">
                <span>ITR Classification</span>
                <div className="progress-bar">
                  <div className="progress-fill complete"></div>
                </div>
              </div>
              <div className="progress-item">
                <span>Regime Analysis</span>
                <div className="progress-bar">
                  <div className="progress-fill complete"></div>
                </div>
              </div>
              <div className="progress-item">
                <span>Auto-filling Forms</span>
                <div className="progress-bar">
                  <div className="progress-fill loading"></div>
                </div>
              </div>
              <div className="ai-suggestion">
                <span className="ai-icon">🧠</span>
                <span>AI suggests: Switch to new regime for ₹25,000 savings!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;