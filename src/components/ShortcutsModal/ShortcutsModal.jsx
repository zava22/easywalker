import React from 'react';
import { X, Keyboard } from 'lucide-react';
import './ShortcutsModal.css';

const ShortcutsModal = ({ isOpen, onClose }) => {
  const shortcuts = [
    { category: 'Navigation', items: [
      { key: 'Ctrl + N', action: 'Create new chat' },
      { key: 'Ctrl + S', action: 'Toggle sidebar' },
      { key: 'Ctrl + K', action: 'Search chats' },
      { key: 'Ctrl + F', action: 'Manage categories' }
    ]},
    { category: 'Chat Actions', items: [
      { key: 'Enter', action: 'Send message' },
      { key: 'Shift + Enter', action: 'New line in message' },
      { key: 'Esc', action: 'Stop AI generation' },
      { key: 'Ctrl + E', action: 'Export current chat' },
      { key: 'Ctrl + D', action: 'Delete current chat' }
    ]},
    { category: 'Settings', items: [
      { key: 'Ctrl + ,', action: 'Open settings' },
      { key: 'Ctrl + /', action: 'Show this help' }
    ]}
  ];

  if (!isOpen) return null;

  return (
    <div className="shortcuts-overlay">
      <div className="shortcuts-modal">
        <div className="shortcuts-header">
          <div className="shortcuts-title">
            <Keyboard size={24} />
            <h2>Keyboard Shortcuts</h2>
          </div>
          <button className="close-shortcuts" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="shortcuts-content">
          {shortcuts.map((category, index) => (
            <div key={index} className="shortcuts-category">
              <h3>{category.category}</h3>
              <div className="shortcuts-list">
                {category.items.map((shortcut, idx) => (
                  <div key={idx} className="shortcut-row">
                    <div className="shortcut-keys">
                      {shortcut.key.split(' + ').map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <kbd className="shortcut-key">{key}</kbd>
                          {keyIdx < shortcut.key.split(' + ').length - 1 && (
                            <span className="key-separator">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <span className="shortcut-description">{shortcut.action}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <p>Press <kbd>Esc</kbd> to close this dialog</p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;