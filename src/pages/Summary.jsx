import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const Summary = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false); // Flag to prevent duplicate calls

  const fetchSummary = useCallback(async () => {
    // Prevent duplicate calls (helps with React StrictMode)
    if (hasFetched.current) {
      return;
    }
    
    hasFetched.current = true;
    
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      const response = await fetch('http://127.0.0.1:3500/get_summary_view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setSummaryData(result.summary_json);
      } else {
        setError('Failed to fetch summary data');
      }
    } catch (error) {
      setError('Connection error. Please try again later.');
      hasFetched.current = false; // Reset flag on error to allow retry
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array since fetchSummary doesn't depend on any external values

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]); // Now properly depends on the memoized function

  const renderJsonValue = (value, key = '', level = 0) => {
    const indent = level * 20;
    
    if (value === null || value === undefined) {
      return (
        <span style={{ color: '#666', fontStyle: 'italic' }}>null</span>
      );
    }
    
    if (typeof value === 'boolean') {
      return (
        <span style={{ color: '#0066cc' }}>{value.toString()}</span>
      );
    }
    
    if (typeof value === 'number') {
      return (
        <span style={{ color: '#ff6600' }}>{value}</span>
      );
    }
    
    if (typeof value === 'string') {
      return (
        <span style={{ color: '#008000' }}>"{value}"</span>
      );
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span style={{ color: '#666' }}>[]</span>;
      }
      
      return (
        <div style={{ marginLeft: indent }}>
          <span style={{ color: '#666' }}>[</span>
          {value.map((item, index) => (
            <div key={index} style={{ marginLeft: 20 }}>
              {renderJsonValue(item, `[${index}]`, level + 1)}
              {index < value.length - 1 && <span style={{ color: '#666' }}>,</span>}
            </div>
          ))}
          <span style={{ color: '#666' }}>]</span>
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return <span style={{ color: '#666' }}>{'{}'}</span>;
      }
      
      return (
        <div style={{ marginLeft: indent }}>
          <span style={{ color: '#666' }}>{'{'}</span>
          {entries.map(([objKey, objValue], index) => (
            <div key={objKey} style={{ marginLeft: 20, margin: '4px 0' }}>
              <span style={{ color: '#8b0000', fontWeight: 'bold' }}>"{objKey}"</span>
              <span style={{ color: '#666' }}>: </span>
              {renderJsonValue(objValue, objKey, level + 1)}
              {index < entries.length - 1 && <span style={{ color: '#666' }}>,</span>}
            </div>
          ))}
          <span style={{ color: '#666' }}>{'}'}</span>
        </div>
      );
    }
    
    return <span>{value}</span>;
  };

  return (
    <div className="app">
      <Header />
      <main style={{ padding: '120px 2rem 80px', minHeight: '70vh' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ color: '#123458', marginBottom: '1rem', textAlign: 'center' }}>
            Tax Filing Summary
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#030303', 
            opacity: 0.8, 
            textAlign: 'center',
            marginBottom: '3rem' 
          }}>
            Here's a summary of your tax filing information collected by Zen.
          </p>
          
          {isLoading ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '4rem 2rem',
              background: '#F1EFEC',
              borderRadius: '12px'
            }}>
              {/* Loading Animation */}
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid #D4C9BE',
                borderTop: '4px solid #123458',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1.5rem'
              }}></div>
              <h3 style={{ color: '#123458', marginBottom: '0.5rem' }}>
                Generating Summary...
              </h3>
              <p style={{ color: '#030303', opacity: 0.7, textAlign: 'center' }}>
                Please wait while we compile your tax information
              </p>
              
              {/* CSS Animation */}
              <style>
                {`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
          ) : error ? (
            <div style={{ 
              padding: '3rem 2rem', 
              background: '#FFE6E6', 
              border: '2px solid #FF4444',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ color: '#FF4444', marginBottom: '1rem' }}>Error Loading Summary</h3>
              <p style={{ color: '#030303', opacity: 0.8, marginBottom: '1.5rem' }}>
                {error}
              </p>
              <button
                onClick={fetchSummary}
                style={{
                  padding: '12px 24px',
                  background: '#123458',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          ) : summaryData ? (
            <div style={{ 
              background: '#FFFFFF', 
              border: '2px solid #D4C9BE',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #F1EFEC'
              }}>
                <h3 style={{ color: '#123458', margin: 0 }}>
                  📊 Summary Data
                </h3>
                <button
                  onClick={fetchSummary}
                  style={{
                    padding: '8px 16px',
                    background: '#F1EFEC',
                    color: '#123458',
                    border: '2px solid #D4C9BE',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Refresh
                </button>
              </div>
              
              <div style={{
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: '14px',
                lineHeight: '1.6',
                background: '#F8F9FA',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #E9ECEF',
                maxHeight: '600px',
                overflowY: 'auto'
              }}>
                {renderJsonValue(summaryData)}
              </div>
              
              <div style={{ 
                marginTop: '1.5rem',
                padding: '1rem',
                background: '#F1EFEC',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#030303', opacity: 0.8, margin: 0 }}>
                  💡 This summary contains all the information collected during your chat with Zen
                </p>
              </div>
            </div>
          ) : (
            <div style={{ 
              padding: '3rem 2rem', 
              background: '#F1EFEC', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
              <h3 style={{ color: '#123458', marginBottom: '1rem' }}>No Summary Available</h3>
              <p style={{ color: '#030303', opacity: 0.8 }}>
                No summary data was found. Please complete the chat process first.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Summary;