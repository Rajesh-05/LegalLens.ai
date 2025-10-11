import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Filing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Return Filing Section, Step 2: File Upload
  const [returnFileSec, setReturnFileSec] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const returnFilingOptions = [
    { value: 11, label: "139(1) - On or before due date" },
    { value: 12, label: "139(4) - After due date" },
    { value: 13, label: "142(1) - In response to notice from ITD" },
    { value: 14, label: "148 - In response to notice from ITD regarding escaped income" },
    { value: 17, label: "139(5) - Revised return" },
    { value: 20, label: "119(2)(b) - After condonation of delay" }
    // { value: 15, label: '153A - In response to notice from ITD during search proceedings' },
    // { value: 16, label: '153C - In response to notice from ITD during search proceedings of another person' },

    // { value: 14, label: '148' },
    // { value: 16, label: '153C' },
    // { value: 18, label: '139(9)' },
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        showErrorPopup('Please select a PDF file only.');
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        showErrorPopup('Please select a PDF file only.');
      }
    }
  };

  const showErrorPopup = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => setShowError(false), 5000);
  };

  const handleFilingSectionSubmit = async () => {
    if (!returnFileSec) {
      showErrorPopup('Please select a return filing section.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:3500/update_profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.user_id,
          FilingStatus: {
            ReturnFileSec: parseInt(returnFileSec)
          }
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Move to next step - file upload
        setCurrentStep(2);
      } else {
        showErrorPopup(result.message || 'Failed to save filing status. Please try again.');
      }
    } catch (error) {
      showErrorPopup('Connection error. Please check if the server is running and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToFilingSection = () => {
    setCurrentStep(1);
  };

  const handleProceed = async () => {
    if (!selectedFile) {
      showErrorPopup('Please select an AIS statement PDF file.');
      return;
    }
    if (!password.trim()) {
      showErrorPopup('Please enter the document password.');
      return;
    }

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('password', password);

    try {
      const response = await fetch('http://127.0.0.1:3500/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        // Navigate to chat page on success
        navigate('/chat');
      } else {
        showErrorPopup(result.message || 'Failed to upload document. Please try again.');
      }
    } catch (error) {
      showErrorPopup('Connection error. Please check if the server is running and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render Step 1: Return Filing Section Selection
  const renderFilingSectionStep = () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Step Indicator */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#F1EFEC',
        borderRadius: '10px'
      }}>
      </div>

      <h1 style={{ color: '#123458', marginBottom: '1rem', textAlign: 'center' }}>
        Return Filing Section
      </h1>
      <p style={{ 
        fontSize: '1.1rem', 
        color: '#030303', 
        opacity: 0.8, 
        textAlign: 'center',
        marginBottom: '3rem' 
      }}>
        Please select the appropriate return filing section for your tax return
      </p>

      {/* Return Filing Section Options */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '1rem', 
          color: '#123458',
          fontWeight: '600',
          fontSize: '1.1rem'
        }}>
          Select Return Filing Section *
        </label>
        <select
          value={returnFileSec}
          onChange={(e) => setReturnFileSec(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #D4C9BE',
            borderRadius: '8px',
            fontSize: '1rem',
            background: '#FFFFFF',
            outline: 'none',
            transition: 'border-color 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#123458'}
          onBlur={(e) => e.target.style.borderColor = '#D4C9BE'}
        >
          <option value="">Select a filing section...</option>
          {returnFilingOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleFilingSectionSubmit}
        disabled={isLoading || !returnFileSec}
        style={{
          width: '100%',
          padding: '16px',
          background: (isLoading || !returnFileSec) ? '#D4C9BE' : '#123458',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: (isLoading || !returnFileSec) ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          opacity: (isLoading || !returnFileSec) ? 0.7 : 1
        }}
      >
        {isLoading ? 'Saving...' : 'Continue to AIS Upload'}
      </button>
    </div>
  );

  // Render Step 2: AIS Upload (existing functionality)
  const renderFileUploadStep = () => (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Step Indicator */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#F1EFEC',
        borderRadius: '10px'
      }}>
      </div>

      <h1 style={{ color: '#123458', marginBottom: '1rem', textAlign: 'center' }}>
        Upload Your AIS Statement
      </h1>
      <p style={{ 
        fontSize: '1.1rem', 
        color: '#030303', 
        opacity: 0.8, 
        textAlign: 'center',
        marginBottom: '3rem' 
      }}>
        Upload your Annual Information Statement (AIS) PDF to begin processing
      </p>

      {/* File Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: dragOver ? '3px dashed #123458' : '2px dashed #D4C9BE',
          borderRadius: '12px',
          padding: '3rem 2rem',
          textAlign: 'center',
          background: dragOver ? '#F1EFEC' : '#FFFFFF',
          marginBottom: '2rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <input
          id="fileInput"
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {selectedFile ? (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ color: '#123458', marginBottom: '0.5rem' }}>
              {selectedFile.name}
            </h3>
            <p style={{ color: '#030303', opacity: 0.6 }}>
              File size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <h3 style={{ color: '#123458', marginBottom: '0.5rem' }}>
              Drag & Drop your AIS PDF here
            </h3>
            <p style={{ color: '#030303', opacity: 0.6 }}>
              or click to browse files
            </p>
          </div>
        )}
      </div>

      {/* Password Field */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          color: '#123458',
          fontWeight: '500'
        }}>
          Document Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter the PDF password"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #D4C9BE',
            borderRadius: '8px',
            fontSize: '1rem',
            background: '#FFFFFF',
            outline: 'none',
            transition: 'border-color 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#123458'}
          onBlur={(e) => e.target.style.borderColor = '#D4C9BE'}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleBackToFilingSection}
          style={{
            flex: '1',
            padding: '16px',
            background: '#D4C9BE',
            color: '#030303',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          Back
        </button>
        <button
          onClick={handleProceed}
          disabled={isLoading}
          style={{
            flex: '2',
            padding: '16px',
            background: isLoading ? '#D4C9BE' : '#123458',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Processing...' : 'Proceed'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="app">
      <Header />
      <main style={{ padding: '120px 2rem 80px', minHeight: '70vh' }}>
        {currentStep === 1 ? renderFilingSectionStep() : renderFileUploadStep()}

        {/* Error Popup */}
        {showError && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#FFFFFF',
            border: '2px solid #FF4444',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            zIndex: 1000,
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#FF4444', marginBottom: '1rem' }}>Error</h3>
            <p style={{ color: '#030303', marginBottom: '1.5rem' }}>{errorMessage}</p>
            <button
              onClick={() => setShowError(false)}
              style={{
                padding: '8px 24px',
                background: '#123458',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              OK
            </button>
          </div>
        )}

        {/* Backdrop */}
        {showError && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.5)',
              zIndex: 999
            }}
            onClick={() => setShowError(false)}
          />
        )}
      </main>
    </div>
  );
};

export default Filing;