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
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fileDropdownOpen && !e.target.closest('.file-upload-trigger')) {
        setFileDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [fileDropdownOpen]);

  const currentChat = getCurrentChat();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      // Smooth scroll to bottom
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [currentChat?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 140); // Max height 140px
      textareaRef.current.style.height = newHeight + 'px';
    }
  }, [input]);

  const handleImageUpload = (e) => {
    e.preventDefault();
    const files = Array.from(e.target.files).slice(0, 4);
    if (!files.length) return;

    const previews = [...attachedImages];
    const base64List = [];
    let processedCount = 0;

    files.forEach((file) => {
      if (previews.length < 4) {
        try {
          const preview = URL.createObjectURL(file);
          previews.push(preview);

          const reader = new FileReader();
          reader.onloadend = () => {
            try {
              const base64 = reader.result.split(",")[1];
              base64List.push({ base64, mime: file.type || "image/jpeg" });
              processedCount++;
              
              if (processedCount === files.length) {
                setImageData((prev) => ([...(prev || []), ...base64List].slice(0, 4)));
              }
            } catch (error) {
              console.error('Error processing image:', error);
              processedCount++;
            }
          };
          reader.onerror = () => {
            console.error('Error reading file:', file.name);
            processedCount++;
          };
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error creating preview:', error);
        }
      }
    });

    setAttachedImages(previews.slice(0, 4));
    // Clear the input to allow re-selecting the same file
    e.target.value = '';
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
            {chats.length === 0 ? (
              <div className="first-visit-welcome">
                <div className="welcome-hero">
                  <div className="welcome-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div className="welcome-glow"></div>
                </div>
                <h1 className="first-visit-title">Добро пожаловать в EasyWalker AI!</h1>
                <p className="first-visit-subtitle">
                  Ваш умный помощник готов к работе. Создайте новый чат и начните общение с передовым искусственным интеллектом.
                </p>
                <button className="create-first-chat-btn" onClick={createNewChat}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Создать новый чат
                </button>
              </div>
            ) : (
              <div className="empty-chat-welcome">
                <div className="welcome-hero">
                  <div className="welcome-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div className="welcome-glow"></div>
                </div>
                <h1 className="welcome-title">Готов к новому разговору!</h1>
                <p className="welcome-subtitle">
                  Выберите тему или задайте любой вопрос — я готов помочь вам в любой области.
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
            )}
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
                    className={`action-btn ${fileDropdownOpen ? 'active' : ''}`}
                    title="Attach files"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFileDropdownOpen(!fileDropdownOpen);
                    }}
                  >
                    <Paperclip size={20} />
                  </button>
                  <div className={`file-upload-dropdown ${fileDropdownOpen ? 'active' : ''}`}>
                    <button 
                      className="file-upload-option"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowFileUpload(!showFileUpload);
                        setFileDropdownOpen(false);
                      }}
                    >
                      <FileText size={18} />
                      Documents
                    </button>
                    <label 
                      className="file-upload-option"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFileDropdownOpen(false);
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        onClick={(e) => e.stopPropagation()}
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