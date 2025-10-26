import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import MarkdownText from '../components/MarkdownText';

const GeneralChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: "Hello! I'm your AI tax assistant. I'm here to help answer your tax-related questions and provide guidance. Feel free to ask me anything about tax laws, deductions, filing procedures, or any other tax-related queries!"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
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
    setSelectedImage(null);
    setIsLoading(true);

    // Prepare form data for API call
    const formData = new FormData();
    formData.append('user_message', messageText);
    formData.append('is_new_chat', messages.length === 1 ? '1' : '0');
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch('http://127.0.0.1:3500/agentic_rag_chat', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: result.response || 'I apologize, but I encountered an issue processing your request.'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'assistant',
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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="app">
      <Header />
      <main style={{ 
        padding: '120px 1rem 1rem', 
        minHeight: '80vh',
        background: '#F1EFEC'
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Chat Header */}
          <div style={{ 
            background: '#123458', 
            color: '#FFFFFF', 
            padding: '1.5rem 2rem',
            textAlign: 'center'
          }}>
            <h2 style={{color:"white", margin: 0, fontSize: '1.5rem' }}>Tax Assistant</h2>
            {/* <p style={{color:"white", margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
              Ask me anything about taxes, laws, deductions, or filing procedures
            </p> */}
          </div>

          {/* Messages Container */}
          <div style={{ 
            flex: '1', 
            padding: '1.5rem', 
            overflowY: 'auto',
            background: '#FAFAFA'
          }}>
            {messages.map((message) => (
              <div key={message.id} style={{ 
                display: 'flex', 
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '1rem',
                fontSize: '1.05rem'
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
                        maxWidth: '180px', 
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
                  <div>Typing...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Area */}
          <div 
            style={{ 
              padding: '1.5rem',
              background: '#FFFFFF',
              borderTop: '1px solid #E0E0E0'
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
                <span style={{ flex: 1, fontSize: '0.9rem', color: '#030303' }}>
                  {selectedImage.name}
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

            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              alignItems: 'flex-end',
              background: dragOver ? '#E3F2FD' : 'transparent',
              padding: dragOver ? '10px' : '0',
              borderRadius: '8px',
              border: dragOver ? '2px dashed #123458' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              
              <button
                onClick={() => fileInputRef.current.click()}
                style={{
                  padding: '12px',
                  background: '#F1EFEC',
                  border: '2px solid #D4C9BE',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Upload Image"
              >
                📎
              </button>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about taxes..."
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
                  background: '#FFFFFF'
                }}
                disabled={isLoading}
                rows={1}
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || (!inputText.trim() && !selectedImage)}
                style={{
                  padding: '12px 20px',
                  background: (isLoading || (!inputText.trim() && !selectedImage)) ? '#D4C9BE' : '#123458',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (isLoading || (!inputText.trim() && !selectedImage)) ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                Send
              </button>
            </div>

            {dragOver && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '10px',
                color: '#123458',
                fontSize: '0.9rem'
              }}>
                Drop your image here to upload
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GeneralChat;