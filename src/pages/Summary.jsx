import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

// Import step images
import fileReturnImg from '../assets/steps_ref/file_return.png';
import importDraftImg from '../assets/steps_ref/import_draft.png';
import attachFileImg from '../assets/steps_ref/attach_file.png';
import downloadNewJsonImg from '../assets/steps_ref/download_new_json.png';
import selectOfflineImg from '../assets/steps_ref/select_offline.png';
import uploadNewJsonImg from '../assets/steps_ref/upload_new_json.png';

const Summary = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);
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

  const handleDownloadJson = () => {
    if (!summaryData) {
      alert('No data available to download');
      return;
    }

    try {
      // Create JSON string with proper formatting
      const jsonString = JSON.stringify(summaryData, null, 2);
      
      // Create blob
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      link.download = `Filed_ITR_${currentDate}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Set downloaded state to true to show next steps
      setHasDownloaded(true);
    } catch (error) {
      alert('Error downloading file. Please try again.');
    }
  };

  const handleDownloadUtility = () => {
    window.open('https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-09/ITDe-Filing-2025-Setup-1.2.4.zip', '_blank');
  };

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
          <h1 style={{ 
            color: '#123458', 
            marginBottom: '1rem', 
            textAlign: 'center',
            fontSize: '2.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #123458 0%, #1e4a72 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
              
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#030303', 
            opacity: 0.7, 
            textAlign: 'center',
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem auto',
            lineHeight: '1.6'
          }}>
          </p>
          
            {/* Your tax information has been processed and is ready for official filing */}
          {isLoading ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '5rem 2rem',
              background: 'linear-gradient(135deg, #F1EFEC 0%, #E8E5E0 100%)',
              borderRadius: '16px',
              border: '2px solid #D4C9BE',
              boxShadow: '0 8px 24px rgba(18, 52, 88, 0.08)'
            }}>
              {/* Loading Animation */}
              <div style={{
                width: '80px',
                height: '80px',
                border: '6px solid #E8E5E0',
                borderTop: '6px solid #123458',
                borderRadius: '50%',
                animation: 'spin 1.2s linear infinite',
                marginBottom: '2rem'
              }}></div>
              <h3 style={{ 
                color: '#123458', 
                marginBottom: '1rem',
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                Processing Your Tax Information
              </h3>
              <p style={{ 
                color: '#030303', 
                opacity: 0.7, 
                textAlign: 'center',
                fontSize: '1.1rem',
                maxWidth: '500px',
                lineHeight: '1.5',
                margin: 0
              }}>
            It may take a few moments to file your tax return. Please do not close or refresh this page.
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
              <h3 style={{ color: '#FF4444', marginBottom: '1rem' }}>Error Loading JSON</h3>
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
              borderRadius: '16px',
              padding: '3rem 2rem',
              boxShadow: '0 8px 24px rgba(18, 52, 88, 0.08)',
              textAlign: 'center'
            }}>
              {/* Success Icon and Title */}
              <div style={{ marginBottom: '2rem' }}>
                {/* <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  ✅
                </div> */}
                <h2 style={{ 
                  color: '#123458', 
                  margin: '0 0 0.5rem 0',
                  fontSize: '2rem',
                  fontWeight: '700'
                }}>
                  ITR Draft Generated Successfully!
                </h2>
                <p style={{ 
                  color: '#030303', 
                  opacity: 0.7, 
                  fontSize: '1.1rem',
                  margin: 0,
                  maxWidth: '600px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  Your tax information has been compiled into a downloadable JSON file ready for ITR filing
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={handleDownloadJson}
                  style={{
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, #123458 0%, #1e4a72 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 16px rgba(18, 52, 88, 0.3)',
                    transition: 'all 0.3s ease',
                    minWidth: '200px',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(18, 52, 88, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 16px rgba(18, 52, 88, 0.3)';
                  }}
                  title="Download your ITR JSON file"
                >
                  {/* <span style={{ fontSize: '1.2rem' }}></span> */}
                  Download ITR JSON
                </button>
                
                <button
                  onClick={fetchSummary}
                  style={{
                    padding: '16px 32px',
                    background: '#FFFFFF',
                    color: '#123458',
                    border: '2px solid #123458',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    minWidth: '150px',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#123458';
                    e.target.style.color = '#FFFFFF';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = '#FFFFFF';
                    e.target.style.color = '#123458';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  title="Refresh the data"
                >
                  {/* <span style={{ fontSize: '1.1rem' }}></span> */}
                  Refresh
                </button>
              </div>

              {/* Info Card */}
              <div style={{ 
                background: 'linear-gradient(135deg, #F1EFEC 0%, #E8E5E0 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #D4C9BE',
                maxWidth: '700px',
                margin: '0 auto'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}></span>
                  <h4 style={{ 
                    color: '#123458', 
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: '600'
                  }}>
                    What's Next?
                  </h4>
                </div>
                <p style={{ 
                  color: '#030303', 
                  opacity: 0.8, 
                  margin: 0,
                  fontSize: '1rem',
                  lineHeight: '1.5'
                }}>
                  Download your ITR JSON file and follow the step-by-step guide below to complete your tax filing with the official ITR utility
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

          {/* Next Steps Section - Show after JSON download */}
          {hasDownloaded && summaryData && (
            <div style={{
              marginTop: '3rem',
              background: '#FFFFFF',
              border: '2px solid #123458',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 12px rgba(18, 52, 88, 0.1)'
            }}>
              <div style={{ 
                textAlign: 'center',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #F1EFEC'
              }}>
                <h2 style={{ color: '#123458', margin: '0 0 1rem 0', fontSize: '1.8rem' }}>
                  🎉 Great! Now Complete Your ITR Filing
                </h2>
                <p style={{ color: '#030303', opacity: 0.8, fontSize: '1.1rem', margin: 0 }}>
                  Follow these simple steps to file your ITR using the downloaded JSON
                </p>
              </div>

              {/* Step 1 */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '1rem',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: '#123458',
                    color: 'white',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>1</div>
                  <h3 style={{ color: '#123458', margin: 0, fontSize: '1.3rem' }}>
                    Download ITR Offline Utility
                  </h3>
                </div>
                <p style={{ color: '#030303', opacity: 0.8, marginBottom: '1rem', marginLeft: '41px' }}>
                  Download the official ITR offline utility from the Income Tax Department website.
                </p>
                <div style={{ marginLeft: '41px' }}>
                  <button
                    onClick={handleDownloadUtility}
                    style={{
                      padding: '12px 24px',
                      background: '#123458',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#1e4a72'}
                    onMouseOut={(e) => e.target.style.background = '#123458'}
                  >
                    📥 Download ITR Utility
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '1rem',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: '#123458',
                    color: 'white',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>2</div>
                  <h3 style={{ color: '#123458', margin: 0, fontSize: '1.3rem' }}>
                    Open Utility and Select "File Return"
                  </h3>
                </div>
                <p style={{ color: '#030303', opacity: 0.8, marginBottom: '1rem', marginLeft: '41px' }}>
                  Install and open the ITR utility, then click on "File Return" option.
                </p>
                <div style={{ marginLeft: '41px' }}>
                  <img 
                    src={fileReturnImg} 
                    alt="File Return Step" 
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto', 
                      borderRadius: '8px',
                      border: '2px solid #D4C9BE',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }} 
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '1rem',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: '#123458',
                    color: 'white',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>3</div>
                  <h3 style={{ color: '#123458', margin: 0, fontSize: '1.3rem' }}>
                    Import Your Downloaded JSON
                  </h3>
                </div>
                <p style={{ color: '#030303', opacity: 0.8, marginBottom: '1rem', marginLeft: '41px' }}>
                  Select "Import draft ITR filled in Online mode or import JSON generated from Excel/HTML utility" and upload your downloaded JSON file.
                </p>
                <div style={{ marginLeft: '41px' }}>
                  <img 
                    src={importDraftImg} 
                    alt="Download New JSON Step" 
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto', 
                      borderRadius: '8px',
                      border: '2px solid #D4C9BE',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }} 
                  />
                </div>
                <div style={{ marginLeft: '41px' }}>
                  <img 
                    src={attachFileImg} 
                    alt="Download New JSON Step" 
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto', 
                      borderRadius: '8px',
                      border: '2px solid #D4C9BE',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }} 
                  />
                </div>
                {/* <div style={{ marginLeft: '41px', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <img 
                    src={importDraftImg} 
                    alt="Import Draft Step" 
                    style={{ 
                      maxWidth: '48%', 
                      height: 'auto', 
                      borderRadius: '8px',
                      border: '2px solid #D4C9BE',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <img 
                    src={attachFileImg} 
                    alt="Attach File Step" 
                    style={{ 
                      maxWidth: '48%', 
                      height: 'auto', 
                      borderRadius: '8px',
                      border: '2px solid #D4C9BE',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }} 
                  />
                </div> */}
              </div>

              {/* Step 4 */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '1rem',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: '#123458',
                    color: 'white',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>4</div>
                  <h3 style={{ color: '#123458', margin: 0, fontSize: '1.3rem' }}>
                    Verify Data and Download New JSON
                  </h3>
                </div>
                <p style={{ color: '#030303', opacity: 0.8, marginBottom: '1rem', marginLeft: '41px' }}>
                  Review all the imported data for accuracy. After verification, the utility will generate a new JSON file for final submission.
                </p>
                <div style={{ marginLeft: '41px' }}>
                  <img 
                    src={downloadNewJsonImg} 
                    alt="Download New JSON Step" 
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto', 
                      borderRadius: '8px',
                      border: '2px solid #D4C9BE',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }} 
                  />
                </div>
              </div>

              {/* Step 5 */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '1rem',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: '#123458',
                    color: 'white',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>5</div>
                  <h3 style={{ color: '#123458', margin: 0, fontSize: '1.3rem' }}>
                    Login to E-Filing Website
                  </h3>
                </div>
                <p style={{ color: '#030303', opacity: 0.8, marginBottom: '1rem', marginLeft: '41px' }}>
                  Go to the Income Tax e-filing website, login with your credentials, and select "Offline Mode" of filing.
                </p>
                <div style={{ marginLeft: '41px' }}>
                  <img 
                    src={selectOfflineImg} 
                    alt="Select Offline Mode Step" 
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto', 
                      borderRadius: '8px',
                      border: '2px solid #D4C9BE',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }} 
                  />
                </div>
              </div>

              {/* Step 6 */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '1rem',
                  gap: '1rem'
                }}>
                  <div style={{
                    background: '#123458',
                    color: 'white',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>6</div>
                  <h3 style={{ color: '#123458', margin: 0, fontSize: '1.3rem' }}>
                    Upload Final JSON and Submit
                  </h3>
                </div>
                <p style={{ color: '#030303', opacity: 0.8, marginBottom: '1rem', marginLeft: '41px' }}>
                  Upload the new JSON file downloaded from the utility and complete your ITR filing. That's it - you've successfully filed your ITR!
                </p>
                <div style={{ marginLeft: '41px' }}>
                  <img 
                    src={uploadNewJsonImg} 
                    alt="Upload New JSON Step" 
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto', 
                      borderRadius: '8px',
                      border: '2px solid #D4C9BE',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }} 
                  />
                </div>
              </div>

              {/* Success Message */}
              <div style={{
                // background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center',
                marginTop: '2rem'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>
                   Congratulations !!
                </h3>
                <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
                  Following these steps will complete your ITR filing successfully. Thank you for using TaxFlow.ai!
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Summary;