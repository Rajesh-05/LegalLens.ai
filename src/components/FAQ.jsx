import { useState } from 'react';
import './FAQ.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How accurate is TaxFlow.ai's ITR classification?",
      answer: "Our AI-powered ITR classifier boasts 99.9% accuracy. It analyzes your income sources, deductions, investments, and other financial factors to automatically determine the correct ITR form. The system is trained on thousands of tax scenarios and continuously updated with the latest tax regulations."
    },
    {
      question: "Can TaxFlow.ai handle complex tax situations?",
      answer: "Yes! TaxFlow.ai is designed to handle various complex scenarios including multiple income sources, capital gains, foreign income, business income, rental income, and more. Our smart chat assistant can guide you through any unique situations, and our expert team is always available for complex cases."
    },
    {
      question: "Is my financial data secure with TaxFlow.ai?",
      answer: "Absolutely. We use bank-grade encryption (256-bit SSL) to protect your data. Your information is stored securely and never shared with third parties. We're fully compliant with data protection regulations and follow strict security protocols. You can delete your data anytime."
    },
    {
      question: "How does the regime selector work?",
      answer: "Our regime selector analyzes your complete financial profile including salary, investments, deductions, and expenses. It calculates your tax liability under both old and new tax regimes and recommends the one that saves you the most money. The analysis includes real-time tax calculations and projections."
    },
    {
      question: "What if I need to file amendments or revisions?",
      answer: "TaxFlow.ai supports filing of revised returns (ITR-U) seamlessly. If you need to make corrections or add missed information, our platform guides you through the amendment process and handles all the technical requirements automatically."
    },
    {
      question: "Do you provide support for CAs and tax professionals?",
      answer: "Yes! We offer a dedicated CA portal with bulk processing capabilities, client management tools, and advanced features. CAs get priority support, training resources, and special pricing for multiple clients. We also provide API access for integration with existing CA software."
    },
    {
      question: "How much can I save with TaxFlow.ai's suggestions?",
      answer: "Our users typically save ₹25,000 to ₹75,000 annually through our AI-powered tax optimization suggestions. The platform identifies investment opportunities, tax-saving instruments, and deduction optimizations specific to your financial situation."
    },
    {
      question: "What's included in the free trial?",
      answer: "The free trial includes full access to ITR classification, regime comparison, basic filing for simple returns, and 5 chat queries with our AI assistant. You can experience the complete platform capabilities before upgrading to a paid plan."
    }
  ];

  return (
    <section className="faq">
      <div className="faq-container">
        <div className="faq-header">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <p className="faq-subtitle">
            Get answers to common questions about TaxFlow.ai and how it can simplify your tax filing process
          </p>
        </div>

        <div className="faq-content">
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{faq.question}</span>
                  <span className={`faq-toggle ${activeIndex === index ? 'active' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path 
                        d="M4 6L8 10L12 6" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                <div className={`faq-answer ${activeIndex === index ? 'active' : ''}`}>
                  <div className="faq-answer-content">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="faq-contact">
            <div className="contact-card">
              <h3>Still have questions?</h3>
              <p>Our support team is here to help you with any specific queries about TaxFlow.ai</p>
              <div className="contact-options">
                <button className="contact-btn primary">Chat with Support</button>
                <button className="contact-btn secondary">Schedule a Call</button>
              </div>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <span>support@taxflow.ai</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <span>+91 98765 43210</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">⏰</span>
                  <span>Mon-Sat: 9 AM - 8 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;