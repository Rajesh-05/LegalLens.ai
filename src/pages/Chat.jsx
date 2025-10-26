import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MarkdownText from '../components/MarkdownText';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'zen',
      text: "Hello! I'm here to help you identify and gather information about all your income sources for accurate tax filing. I'll ask you some questions to ensure we cover everything comprehensively. Can we start?"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showProceedButton, setShowProceedButton] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText = inputText, imageFile = selectedImage) => {
    if (!messageText.trim() && !imageFile) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: messageText,
      image: imageFile ? URL.createObjectURL(imageFile) : null
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null); // Clear selected image after sending
    setIsLoading(true);

    // Prepare form data for API call
    const formData = new FormData();
    formData.append('user_message', messageText);
    formData.append('is_new_chat', messages.length === 1 ? '1' : '0');
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch('http://127.0.0.1:3500/get_details', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      // Check if response contains proceed: true
      if (result.proceed === true) {
        setShowProceedButton(true);
      }
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        sender: 'zen',
        text: result.response || 'I apologize, but I encountered an issue processing your request.'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'zen',
        text: 'I apologize, but I\'m having trouble connecting to my services. Please try again later.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
      }
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        setSelectedImage(file);
        break;
      }
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  const handleProceed = () => {
    navigate('/summary');
  };

  return (
    <div className="app">
      <Header />
      <main style={{ 
        padding: '120px 0 140px 0 ', 
        height: 'calc(100vh - 120px)', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        {/* Fixed Proceed Button */}
        {showProceedButton && (
          <div style={{
            position: 'fixed',
            right: '5rem',
            top: '90.5%',
            transform: 'translateY(-50%)',
            zIndex: 1000
          }}>
            <button
              onClick={handleProceed}
              style={{
                padding: '16px 24px',
                background: '#123458',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '20px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(18, 52, 88, 0.4)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '160px',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 8px 25px rgba(18, 52, 88, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(18, 52, 88, 0.4)';
              }}
            >
              <span>Proceed</span>
              {/* <span style={{ fontSize: '1.2rem' }}>→</span> */}
            </button>
          </div>
        )}

        {/* Messages Container */}
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          width: '100%', 
          flex: '1',
          padding: '1.5rem 2rem', 
          overflowY: 'auto',
          borderRadius: '20px',
          background: '#FAFAFA'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        >
            {messages.map((message) => (
              <div key={message.id} style={{ 
                display: 'flex', 
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '14px 18px',
                  borderRadius: '18px',
                  background: message.sender === 'user' ? '#123458' : '#F1EFEC',
                  color: message.sender === 'user' ? '#FFFFFF' : '#030303',
                  fontSize: '1.05rem',
                  lineHeight: '1.4'
                }}>
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="Uploaded" 
                      style={{ 
                        maxWidth: '200px', 
                        borderRadius: '8px', 
                        marginBottom: '8px',
                        display: 'block'
                      }} 
                    />
                  )}
                  <MarkdownText>{message.text}</MarkdownText>
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '18px',
                  background: '#F1EFEC',
                  color: '#030303',
                  fontSize: '1.1rem'
                }}>
                  <div>Zen is typing...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Fixed Message Input Area */}
        <div 
          style={{ 
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            height: '110px',
            maxWidth: '1000px',
            padding: '1.5rem 2rem',
            background: '#FFFFFF',
            borderTop: '1px solid #E0E0E0',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
            zIndex: 100
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
            {/* Selected Image Preview */}
            {selectedImage && (
              <div style={{ 
                marginBottom: '1rem', 
                padding: '0.5rem',
                background: '#F1EFEC',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <img 
                  src={URL.createObjectURL(selectedImage)} 
                  alt="Selected" 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '4px',
                    objectFit: 'cover'
                  }}
                />
                <span style={{ flex: 1, fontSize: '1rem', color: '#030303' }}>
                  Image selected for upload
                </span>
                <button 
                  onClick={removeSelectedImage}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FF4444',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                >
                  ×
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '14px',
                  background: '#123458',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '50px',
                  height: '50px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#1e4a72'}
                onMouseOut={(e) => e.target.style.background = '#123458'}
              >
                📎
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                onPaste={handlePaste}
                placeholder={selectedImage ? "Add a message about this image..." : "Type your message... (You can also paste images with Ctrl+V)"}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  border: '2px solid #D4C9BE',
                  borderRadius: '10px',
                  resize: 'none',
                  minHeight: '50px',
                  maxHeight: '120px',
                  fontFamily: 'inherit',
                  fontSize: '1.1rem',
                  lineHeight: '1.4',
                  outline: 'none',
                  background: '#FFFFFF',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#123458'}
                onBlur={(e) => e.target.style.borderColor = '#D4C9BE'}
                rows={1}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={(!inputText.trim() && !selectedImage) || isLoading}
                style={{
                  padding: '14px 24px',
                  background: ((!inputText.trim() && !selectedImage) || isLoading) ? '#D4C9BE' : '#123458',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: ((!inputText.trim() && !selectedImage) || isLoading) ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  minWidth: '80px',
                  height: '50px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  if (!(((!inputText.trim() && !selectedImage) || isLoading))) {
                    e.target.style.background = '#1e4a72';
                  }
                }}
                onMouseOut={(e) => {
                  if (!(((!inputText.trim() && !selectedImage) || isLoading))) {
                    e.target.style.background = '#123458';
                  }
                }}
              >
                Send
              </button>
            </div>

            {/* Drag and Drop Overlay */}
            {dragOver && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(18, 52, 88, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  background: '#FFFFFF',
                  padding: '3rem',
                  borderRadius: '20px',
                  textAlign: 'center',
                  border: '3px dashed #123458',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📎</div>
                  <h3 style={{ color: '#123458', fontSize: '1.5rem', margin: '0' }}>Drop your image here</h3>
                </div>
              </div>
            )}
          </div>
      </main>
    </div>
  );
};

export default Chat;