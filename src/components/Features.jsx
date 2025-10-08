import './Features.css';

const Features = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Automatic ITR Classifier',
      description: 'Our AI automatically identifies the correct ITR form based on your income sources, deductions, and financial profile.',
      benefits: ['Eliminates guesswork', 'Saves time', '100% accuracy guaranteed']
    },
    {
      icon: '⚖️',
      title: 'Smart Regime Selector',
      description: 'Advanced algorithms analyze your tax situation to recommend the most beneficial tax regime - old or new.',
      benefits: ['Maximizes savings', 'Compares both regimes', 'Real-time calculations']
    },
    {
      icon: '📋',
      title: 'Automated ITR Filing',
      description: 'End-to-end automated filing process that handles forms, validations, and submissions seamlessly.',
      benefits: ['Zero manual work', 'Error-free filing', 'Instant acknowledgment']
    },
    {
      icon: '💬',
      title: 'Smart Chat Assistant',
      description: 'AI-powered chat assistant that answers tax queries, provides guidance, and helps with complex scenarios.',
      benefits: ['24/7 availability', 'Expert knowledge', 'Instant responses']
    },
    {
      icon: '💡',
      title: 'AI Tax Saving Suggestions',
      description: 'Personalized recommendations for tax-saving investments, deductions, and financial planning strategies.',
      benefits: ['Personalized advice', 'Investment suggestions', 'Maximize deductions']
    },
    {
      icon: '📊',
      title: 'Comprehensive Analytics',
      description: 'Detailed insights into your tax patterns, savings opportunities, and year-over-year comparisons.',
      benefits: ['Visual dashboards', 'Trend analysis', 'Performance tracking']
    }
  ];

  return (
    <section className="features">
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">
            Powerful Features That Simplify Tax Filing
          </h2>
          <p className="features-subtitle">
            Experience the future of tax management with our comprehensive AI-driven platform
          </p>
        </div>

        <div className="features-zigzag">
          {features.map((feature, index) => (
            <div key={index} className={`feature-row ${index % 2 === 0 ? 'left-align' : 'right-align'}`}>
              <div className="feature-content">
                <div className="feature-text">
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  <ul className="feature-benefits">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="benefit-item">
                        <span className="check-icon">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="feature-visual">
                  <div className="visual-placeholder">
                    <div className="visual-icon">{feature.icon}</div>
                    <div className="visual-lines">
                      <div className="line"></div>
                      <div className="line"></div>
                      <div className="line"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="features-cta">
          <h3>Ready to Transform Your Tax Experience?</h3>
          <p style={{ color: 'white' }}>Join thousands of satisfied users who've simplified their tax filing with TaxFlow.ai</p>
          <button className="features-cta-button">Start Your Free Trial</button>
        </div>
      </div>
    </section>
  );
};

export default Features;