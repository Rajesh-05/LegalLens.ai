import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>TaxFlow.ai</h3>
            <p>
              Revolutionizing tax filing with AI-powered automation. 
              Make tax season effortless with our intelligent platform.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">
                <span>📧</span>
              </a>
              <a href="#" className="social-link">
                <span>📱</span>
              </a>
              <a href="#" className="social-link">
                <span>💼</span>
              </a>
              <a href="#" className="social-link">
                <span>🐦</span>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Products</h4>
            <ul>
              <li><a href="#itr-classifier">ITR Classifier</a></li>
              <li><a href="#regime-selector">Regime Selector</a></li>
              <li><a href="#automated-filing">Automated Filing</a></li>
              <li><a href="#chat-assistant">Smart Assistant</a></li>
              <li><a href="#tax-savings">Tax Savings AI</a></li>
              <li><a href="#ca-portal">CA Portal</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#help-center">Help Center</a></li>
              <li><a href="#documentation">Documentation</a></li>
              <li><a href="#tutorials">Video Tutorials</a></li>
              <li><a href="#webinars">Tax Webinars</a></li>
              <li><a href="#status">System Status</a></li>
              <li><a href="#feedback">Feedback</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#press">Press Kit</a></li>
              <li><a href="#partnerships">Partnerships</a></li>
              <li><a href="#investors">Investors</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="contact-details">
              <div className="contact-item">
                {/* <span className="contact-icon">📍</span> */}
                <div>
                  <strong>Headquarters</strong>
                  <p>Bangalore, Karnataka, India</p>
                </div>
              </div>
              <div className="contact-item">
                {/* <span className="contact-icon">📧</span> */}
                <div>
                  <strong>Email</strong>
                  <p>support@taxflow.ai</p>
                </div>
              </div>
              <div className="contact-item">
                {/* <span className="contact-icon">📞</span> */}
                <div>
                  <strong>Phone</strong>
                  <p>+91 98765 43210</p>
                </div>
              </div>
 
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-legal">
            <div className="legal-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
              <a href="#security">Security</a>
              <a href="#compliance">Compliance</a>
            </div>
            <div className="certifications">
              <span className="cert-badge">🔒 SOC 2 Certified</span>
              <span className="cert-badge">✅ ISO 27001</span>
              <span className="cert-badge">🛡️ GDPR Compliant</span>
            </div>
          </div>
          <div className="footer-copyright">
            <p>&copy; 2025 TaxFlow.ai. All rights reserved.</p>
            <p className="footer-tagline">Built with ❤️ for Indian taxpayers</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;