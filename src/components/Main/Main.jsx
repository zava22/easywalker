import React, { useContext, useEffect, useState } from 'react';
import './Main.css';
import { assets } from "../../assets/assets";
import { Context } from '../../context/Context';

const Main = () => {
  const {
    onSent,
    recentPrompt,
    showResult,
    resultData,
    setInput,
    input,
    loading,
    stopGenerating,
    isGenerating,
    attachedImages,
    setAttachedImages,
    setImageData,
    prevPrompts
  } = useContext(Context);

  const [isVisible, setIsVisible] = useState(false);
  const [copyMsg, setCopyMsg] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const copyResponse = () => {
    const plainText = resultData.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
    navigator.clipboard.writeText(plainText).then(() => {
      setCopyMsg("✅ Скопировано");
      setTimeout(() => setCopyMsg(""), 2000);
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 2);
    if (!files.length) return;

    const previews = [...attachedImages];
    const base64List = [];

    files.forEach((file) => {
      if (previews.length < 2) {
        previews.push(URL.createObjectURL(file));

        const reader = new FileReader();
        reader.onloadend = () => {
          base64List.push({ base64: reader.result.split(",")[1], mime: file.type || "image/jpeg" });
          if (base64List.length === files.length) {
            setImageData((prev) => ([...(prev || []), ...base64List].slice(0, 2)));
          }
        };
        reader.readAsDataURL(file);
      }
    });

    setAttachedImages(previews.slice(0, 2));
  };

  const removeImage = (index) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
    setImageData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() || (attachedImages && attachedImages.length)) onSent();
    }
  };

  const currentChatImages = prevPrompts.length > 0 && prevPrompts[0].images ? prevPrompts[0].images : [];

  return (
    <div className='main' data-theme="light">
      <div className="nav">
        <div className="logo">
          <span className="logo-gradient">easywalker</span>
        </div>
        <div className="user-profile">
          <div className="user-badge">
            <span className="user-name"></span>
            <div className="user-status"></div>
          </div>
          <img src={assets.user_icon} alt="user" className="user-avatar" />
        </div>
      </div>

      <div className="main-container">
        {!showResult ? (
          <>
            <div className={`greet ${isVisible ? 'fade-in' : ''}`}>
              <h1><span className="gradient-text">Hello, Dev.</span></h1>
              <p>How can I help you today?</p>
            </div>

            <div className="cards">
              <div className={`card ${isVisible ? 'slide-up' : ''}`} style={{ transitionDelay: '0.1s' }}>
                <p>Suggest beautiful places to see on an upcoming road trip</p>
                <div className="card-icon">
                  <img src={assets.compass_icon} alt="compass" />
                </div>
              </div>
              <div className={`card ${isVisible ? 'slide-up' : ''}`} style={{ transitionDelay: '0.2s' }}>
                <p>Briefly summarize this concept: urban planning</p>
                <div className="card-icon">
                  <img src={assets.bulb_icon} alt="bulb" />
                </div>
              </div>
              <div className={`card ${isVisible ? 'slide-up' : ''}`} style={{ transitionDelay: '0.3s' }}>
                <p>Brainstorm team bonding activities for our work retreat</p>
                <div className="card-icon">
                  <img src={assets.message_icon} alt="message" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="result">
            <div className="result-title">
              <div className="avatar-circle">
                <img src={assets.user_icon} alt="" />
              </div>
              <p>{recentPrompt}</p>
            </div>

            {currentChatImages && currentChatImages.length > 0 && (
              <div className="chat-image-preview">
                {currentChatImages.map((src, idx) => (
                  <img key={idx} src={src} alt={`chat-img-${idx}`} />
                ))}
              </div>
            )}

            <div className="result-data">
              <div className="ai-avatar">
                <div className="ai-icon-wrapper">
                  <img src={assets.gemini_icon} alt="" />
                </div>
              </div>
              {loading ? (
                <div className='loader'>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              ) : (
                <div className="response-content">
                  <p dangerouslySetInnerHTML={{ __html: resultData }} />
                  <button className="copy-btn" onClick={copyResponse}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 4h6a2 2 0 012 2v6a2 2 0 01-2 2h-8a2 2 0 01-2-2v-6z" />
                    </svg>
                    Copy
                  </button>
                  {copyMsg && <span className="copy-msg">{copyMsg}</span>}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bottom">
          {attachedImages && attachedImages.length > 0 && (
            <div className="image-preview-box">
              {attachedImages.map((src, idx) => (
                <div className="image-item" key={idx}>
                  <img src={src} alt={`preview-${idx}`} />
                  <button className="remove-image" onClick={() => removeImage(idx)}>✖</button>
                </div>
              ))}
            </div>
          )}

          <div className='search-box'>
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder='Enter a prompt here...'
              className={input.trim() ? 'has-content' : ''}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <div className="search-icons">
              <label className="icon-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
                <img src={assets.gallery_icon} alt="gallery" />
              </label>
              <div className="icon-wrapper">
                <img src={assets.mic_icon} alt="mic" />
              </div>
              {isGenerating ? (
                <button className="stop-generating" onClick={stopGenerating}>
                  <div className="stop-icon"></div>
                </button>
              ) : (
                <button
                  onClick={() => { if (input.trim() || (attachedImages && attachedImages.length)) onSent(); }}
                  className={`send-btn ${(!input.trim() && (!attachedImages || !attachedImages.length)) ? "disabled" : ""}`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <p className="bottom-info">
            Gemini may display inaccurate info, including about people, so double-check its responses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
