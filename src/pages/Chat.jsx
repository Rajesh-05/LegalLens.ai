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
  const [chatDisabled, setChatDisabled] = useState(false);
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
    if (chatDisabled) return; // Prevent sending if chat is disabled

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
        setChatDisabled(true);
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
        padding: '120px 0 0 0', 
        height: 'calc(100vh - 120px)', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          width: '100%', 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '0 2rem'
        }}>
          {/* Messages Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem 1rem 1rem 1rem',
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            borderRadius: '12px 12px 0 0',
            border: '2px solid #D4C9BE',
            borderBottom: 'none'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          >
            {messages.map((message) => (
              <div key={message.id} style={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  background: message.sender === 'user' ? '#123458' : '#F1EFEC',
                  color: message.sender === 'user' ? '#FFFFFF' : '#030303'
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
                  padding: '12px 16px',
                  borderRadius: '18px',
                  background: '#F1EFEC',
                  color: '#030303'
                }}>
                  <div>Zen is typing...</div>
                </div>
              </div>
            )}

            {showProceedButton && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                <button
                  onClick={handleProceed}
                  style={{
                    padding: '12px 24px',
                    background: '#123458',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(18, 52, 88, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Proceed →
                </button>
              </div>
            )}

            {dragOver && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(18, 52, 88, 0.1)',
                border: '3px dashed #123458',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}>
                <div style={{
                  background: '#FFFFFF',
                  padding: '2rem',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📎</div>
                  <h3 style={{ color: '#123458' }}>Drop your image here</h3>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '1rem',
            background: '#F1EFEC',
            borderRadius: '0 0 12px 12px',
            border: '2px solid #D4C9BE',
            borderTop: 'none',
            position: 'sticky',
            bottom: 0
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              {/* Image Preview */}
              {selectedImage && (
                <div style={{
                  position: 'relative',
                  marginRight: '0.5rem'
                }}>
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #D4C9BE'
                    }}
                  />
                  <button
                    onClick={removeSelectedImage}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#FF4444',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={chatDisabled}
                style={{
                  padding: '12px',
                  background: chatDisabled ? '#D4C9BE' : '#123458',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: chatDisabled ? 'not-allowed' : 'pointer',
                  fontSize: '1.2rem',
                  opacity: chatDisabled ? 0.6 : 1
                }}
              >
                📎
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={chatDisabled}
                style={{ display: 'none' }}
              />
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                onPaste={handlePaste}
                disabled={chatDisabled}
                placeholder={chatDisabled ? "Chat completed. Please click Proceed to continue." : (selectedImage ? "Add a message about this image..." : "Type your message... (You can also paste images with Ctrl+V)")}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '2px solid #D4C9BE',
                  borderRadius: '8px',
                  resize: 'none',
                  minHeight: '50px',
                  maxHeight: '120px',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  outline: 'none',
                  background: chatDisabled ? '#F5F5F5' : '#FFFFFF',
                  opacity: chatDisabled ? 0.6 : 1
                }}
                rows={1}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={(!inputText.trim() && !selectedImage) || isLoading || chatDisabled}
                style={{
                  padding: '12px 20px',
                  background: ((!inputText.trim() && !selectedImage) || isLoading || chatDisabled) ? '#D4C9BE' : '#123458',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: ((!inputText.trim() && !selectedImage) || isLoading || chatDisabled) ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: chatDisabled ? 0.6 : 1
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;