import React, { useState, useEffect, useContext } from 'react';
import { Context } from '../../context/Context';
import { Search, X, Clock, MessageSquare } from 'lucide-react';
import './SearchModal.css';

const SearchModal = ({ isOpen, onClose }) => {
  const { chats, selectChat } = useContext(Context);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results = [];
    const query = searchQuery.toLowerCase();

    chats.forEach(chat => {
      // Search in chat title
      if (chat.title.toLowerCase().includes(query)) {
        results.push({
          type: 'title',
          chat,
          highlight: chat.title,
          score: 10
        });
      }

      // Search in messages
      chat.messages.forEach((message, index) => {
        const content = message.content.replace(/<[^>]+>/g, '').toLowerCase();
        if (content.includes(query)) {
          const startIndex = content.indexOf(query);
          const contextStart = Math.max(0, startIndex - 50);
          const contextEnd = Math.min(content.length, startIndex + query.length + 50);
          const context = content.substring(contextStart, contextEnd);
          
          results.push({
            type: 'message',
            chat,
            message,
            messageIndex: index,
            highlight: context,
            score: 5
          });
        }
      });
    });

    // Sort by score and limit results
    results.sort((a, b) => b.score - a.score);
    setSearchResults(results.slice(0, 20));
  }, [searchQuery, chats]);

  const handleResultClick = (result) => {
    selectChat(result.chat.id);
    onClose();
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay">
      <div className="search-modal">
        <div className="search-header">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search chats and messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>
          <button className="close-search" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="search-results">
          {searchQuery && searchResults.length === 0 && (
            <div className="no-results">
              <Search size={48} />
              <p>No results found for "{searchQuery}"</p>
            </div>
          )}

          {searchResults.map((result, index) => (
            <div
              key={`${result.chat.id}-${result.type}-${index}`}
              className="search-result"
              onClick={() => handleResultClick(result)}
            >
              <div className="result-icon">
                {result.type === 'title' ? (
                  <MessageSquare size={20} />
                ) : (
                  <Clock size={20} />
                )}
              </div>
              <div className="result-content">
                <div className="result-title">
                  {result.type === 'title' ? (
                    <span dangerouslySetInnerHTML={{ 
                      __html: highlightText(result.chat.title, searchQuery) 
                    }} />
                  ) : (
                    result.chat.title
                  )}
                </div>
                <div className="result-preview">
                  {result.type === 'message' ? (
                    <>
                      <span className="message-role">
                        {result.message.role === 'user' ? 'You' : 'AI'}:
                      </span>
                      <span dangerouslySetInnerHTML={{ 
                        __html: highlightText(result.highlight, searchQuery) 
                      }} />
                    </>
                  ) : (
                    <span className="result-type">Chat title match</span>
                  )}
                </div>
                <div className="result-date">
                  {new Date(result.chat.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!searchQuery && (
          <div className="search-tips">
            <h3>Search Tips</h3>
            <ul>
              <li>Search by keywords in your messages</li>
              <li>Find chats by title</li>
              <li>Use specific terms for better results</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;