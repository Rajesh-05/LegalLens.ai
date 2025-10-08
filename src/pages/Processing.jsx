import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Processing = () => {
  const { user } = useAuth();

  return (
    <div className="app">
      <Header />
      <main style={{ padding: '120px 2rem 80px', minHeight: '70vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ color: '#123458', marginBottom: '2rem' }}>Processing Your AIS Statement</h1>
          <p style={{ fontSize: '1.2rem', color: '#030303', opacity: 0.8, marginBottom: '3rem' }}>
            Great! Your AIS statement has been successfully uploaded. We're now processing your document.
          </p>
          
          <div style={{ 
            padding: '3rem 2rem', 
            background: '#F1EFEC', 
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ color: '#123458', marginBottom: '1rem' }}>Upload Successful!</h3>
            <p style={{ color: '#030303', opacity: 0.8 }}>
              Your AIS statement is being analyzed by our AI system. This may take a few moments.
            </p>
          </div>

          <div style={{ 
            padding: '2rem', 
            background: '#FFFFFF', 
            border: '2px solid #D4C9BE',
            borderRadius: '12px'
          }}>
            <h4 style={{ color: '#123458', marginBottom: '1rem' }}>What's Next?</h4>
            <p style={{ color: '#030303', opacity: 0.8 }}>
              Our AI will extract relevant tax information from your AIS statement and prepare your tax filing documents automatically.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Processing;