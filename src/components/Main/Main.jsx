import React, { useContext, useEffect, useRef, useState } from 'react';
import './Main.css';
import { assets } from "../../assets/assets";
import { Context } from '../../context/Context';
import { Download, Search, Settings, FolderPlus, Keyboard, BookOpen, Bot, FileText, Image } from 'lucide-react';
import ImageModal from '../ImageModal/ImageModal';
import FileUpload from '../FileUpload/FileUpload';
import PromptTemplates from '../PromptTemplates/PromptTemplates';
import AIPersonality from '../AIPersonality/AIPersonality';
import { Paperclip } from 'lucide-react';

const Main = () => {
  const {
    input,
    setInput,
    loading,
    onSent,
    stopGenerating,
    isGenerating,
    attachedImages,
    setAttachedImages,
    setImageData,
    chats,
    currentChatId,
    getCurrentChat,
    createNewChat,
    setSidebarOpen,
    exportCurrentChat
  } = useContext(Context);

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalInitialIndex, setModalInitialIndex] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [personalityOpen, setPersonalityOpen] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const currentChat = getCurrentChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentChat?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    if (!files.length) return;

    const previews = [...attachedImages];
    const base64List = [];

    files.forEach((file) => {
      if (previews.length < 4) {
        previews.push(URL.createObjectURL(file));

        const reader = new FileReader();
        reader.onloadend = () => {
          base64List.push({ base64: reader.result.split(",")[1], mime: file.type || "image/jpeg" });
          if (base64List.length === files.length) {
            setImageData((prev) => ([...(prev || []), ...base64List].slice(0, 4)));
          }
        };
        reader.readAsDataURL(file);
      }
    });

    setAttachedImages(previews.slice(0, 4));
  };

  const removeImage = (index) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
    setImageData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() || (attachedImages && attachedImages.length)) {
        onSent();
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    onSent(suggestion);
  };

  const copyToClipboard = (text) => {
    const plainText = text.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
    navigator.clipboard.writeText(plainText);
    
    // Show toast notification (you can implement this)
    console.log('Copied to clipboard!');
  };

  const handleImageClick = (images, index) => {
    setModalImages(images);
    setModalInitialIndex(index);
    setImageModalOpen(true);
  };

  const handleFileProcessed = (file) => {
    // Just add to attached files, don't modify input
    console.log('File processed:', file.fileName);
  };

  const handleTemplateSelect = (templateContent) => {
    setInput(templateContent);
  };

  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a creative story about time travel",
    "Help me plan a healthy meal for the week",
    "What are the latest trends in web development?"
  ];

  return (
    <div className='main'>
      <div className="nav">
        <div className="nav-left">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <div className="logo">EasyWalker AI</div>
        </div>
        <div className="user-profile">
          <div className="header-actions">
            <button 
              className="header-btn" 
              onClick={() => window.dispatchEvent(new CustomEvent('openSearch'))}
              title="Search (Ctrl+K)"
            >
              <Search size={20} />
            </button>
            <button 
              className="header-btn" 
              onClick={() => window.dispatchEvent(new CustomEvent('openCategories'))}
              title="Categories (Ctrl+F)"
            >
              <FolderPlus size={20} />
            </button>
            {currentChat && (
              <button 
                className="header-btn" 
                onClick={exportCurrentChat}
                title="Export Chat (Ctrl+E)"
              >
                <Download size={20} />
              </button>
            )}
            <button 
              className="header-btn" 
              onClick={() => window.dispatchEvent(new CustomEvent('openSettings'))}
              title="Settings (Ctrl+,)"
            >
              <Settings size={20} />
            </button>
            <button 
              className="header-btn" 
              onClick={() => window.dispatchEvent(new CustomEvent('openShortcuts'))}
              title="Shortcuts (Ctrl+/)"
            >
              <Keyboard size={20} />
            </button>
            <button 
              className="header-btn" 
              onClick={() => setTemplatesOpen(true)}
              title="Prompt Templates"
            >
              <BookOpen size={20} />
            </button>
            <button 
              className="header-btn" 
              onClick={() => setPersonalityOpen(true)}
              title="AI Personality"
            >
              <Bot size={20} />
            </button>
          </div>
          <img src={assets.user_icon} alt="user" className="user-avatar" />
        </div>
      </div>

      <div className="main-content">
        {!currentChat || currentChat.messages.length === 0 ? (
          <div className="welcome-screen">
            <h1 className="welcome-title">Hello, Developer!</h1>
            <p className="welcome-subtitle">
              I'm your AI assistant. How can I help you today?
            </p>
            <div className="suggestion-cards">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-card"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <p>{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="chat-container" ref={chatContainerRef}>
            {currentChat.messages.map((message, index) => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className={`message-avatar ${message.role}`}>
                  {message.role === 'user' ? (
                    <img src={assets.user_icon} alt="user" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  )}
                </div>
                <div className="message-content">
                  {message.images && message.images.length > 0 && (
                    <div className="message-images">
                      {message.images.map((src, idx) => (
                        <img 
                          key={idx} 
                          src={src} 
                          alt={`attachment-${idx}`} 
                          className="message-image clickable" 
                          onClick={() => handleImageClick(message.images, idx)}
                        />
                      ))}
                    </div>
                  )}
                  {message.content ? (
                    <>
                      <div className="message-text" dangerouslySetInnerHTML={{ __html: message.content }} />
                      {message.role === 'assistant' && (
                        <button className="copy-btn" onClick={() => copyToClipboard(message.content)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="loading-message">
                      <span>AI is thinking</span>
                      <div className="loading-dots">
                        <div className="loading-dot"></div>
                        <div className="loading-dot"></div>
                        <div className="loading-dot"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="input-area">
          <div className="input-container">
            {showFileUpload && (
              <FileUpload 
                onFileProcessed={handleFileProcessed}
                attachedFiles={attachedFiles}
                setAttachedFiles={setAttachedFiles}
                onClose={() => setShowFileUpload(false)}
              />
            )}
            
            {attachedImages.length > 0 && (
              <div className="image-preview">
                {attachedImages.map((src, idx) => (
                  <div className="image-preview-item" key={idx}>
                    <img src={src} alt={`preview-${idx}`} />
                    <button className="remove-image" onClick={() => removeImage(idx)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="input-wrapper">
              <textarea
                ref={textareaRef}
                className="message-input"
                placeholder="Type your message here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              
              <div className="input-actions">
                <div className="file-upload-trigger">
                  <button 
                    className="action-btn"
                    title="Attach files"
                  >
                    <Paperclip size={20} />
                  </button>
                  <div className="file-upload-dropdown">
                    <button 
                      className="file-upload-option"
                      onClick={() => setShowFileUpload(!showFileUpload)}
                    >
                      <FileText size={18} />
                      Documents
                    </button>
                    <label className="file-upload-option">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <Image size={18} />
                      Images
                    </label>
                  </div>
                </div>
                
                {isGenerating ? (
                  <button className="action-btn stop-btn" onClick={stopGenerating}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  </button>
                ) : (
                  <button
                    className="action-btn send-btn"
                    onClick={() => {
                      if (input.trim() || attachedImages.length) {
                        if (!currentChatId) createNewChat();
                        setAttachedFiles([]);
                        onSent();
                      }
                    }}
                    disabled={!input.trim() && !attachedImages.length}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        images={modalImages}
        initialIndex={modalInitialIndex}
      />
      
      <PromptTemplates
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onSelectTemplate={handleTemplateSelect}
      />
      
      <AIPersonality
        isOpen={personalityOpen}
        onClose={() => setPersonalityOpen(false)}
      />
    </div>
  );
};

export default Main;