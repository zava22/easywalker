import React, { useContext, useState } from 'react';
import { Context } from '../../context/Context';
import { X, Palette, Download, Search, FolderPlus, Keyboard, Moon, Sun, Monitor } from 'lucide-react';
import './Settings.css';

const Settings = ({ isOpen, onClose }) => {
  const { 
    theme, 
    setTheme, 
    fontSize, 
    setFontSize, 
    colorScheme, 
    setColorScheme,
    exportAllChats,
    clearAllChats,
    autoSave,
    setAutoSave,
    soundEnabled,
    setSoundEnabled,
    animationsEnabled,
    setAnimationsEnabled
  } = useContext(Context);

  const [activeTab, setActiveTab] = useState('appearance');

  const themes = [
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'auto', name: 'Auto', icon: Monitor }
  ];

  const colorSchemes = [
    { id: 'purple', name: 'Purple Gradient', colors: ['#8b5cf6', '#3b82f6'] },
    { id: 'blue', name: 'Ocean Blue', colors: ['#0ea5e9', '#06b6d4'] },
    { id: 'green', name: 'Forest Green', colors: ['#10b981', '#059669'] },
    { id: 'orange', name: 'Sunset Orange', colors: ['#f59e0b', '#ea580c'] },
    { id: 'pink', name: 'Rose Pink', colors: ['#ec4899', '#be185d'] },
    { id: 'red', name: 'Ruby Red', colors: ['#ef4444', '#dc2626'] }
  ];

  const fontSizes = [
    { id: 'small', name: 'Small', size: '14px' },
    { id: 'medium', name: 'Medium', size: '16px' },
    { id: 'large', name: 'Large', size: '18px' },
    { id: 'xl', name: 'Extra Large', size: '20px' }
  ];

  const shortcuts = [
    { key: 'Ctrl + N', action: 'New Chat' },
    { key: 'Ctrl + K', action: 'Search Chats' },
    { key: 'Ctrl + E', action: 'Export Current Chat' },
    { key: 'Ctrl + D', action: 'Delete Current Chat' },
    { key: 'Ctrl + S', action: 'Toggle Sidebar' },
    { key: 'Ctrl + /', action: 'Show Shortcuts' },
    { key: 'Enter', action: 'Send Message' },
    { key: 'Shift + Enter', action: 'New Line' },
    { key: 'Esc', action: 'Stop Generation' }
  ];

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    // Apply theme immediately
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleColorSchemeChange = (newColorScheme) => {
    setColorScheme(newColorScheme);
    // Apply color scheme immediately
    document.documentElement.setAttribute('data-color-scheme', newColorScheme);
  };

  const handleFontSizeChange = (newFontSize) => {
    setFontSize(newFontSize);
    // Apply font size immediately
    document.documentElement.setAttribute('data-font-size', newFontSize);
  };

  const handleAnimationsChange = (enabled) => {
    setAnimationsEnabled(enabled);
    // Apply animations setting immediately
    document.documentElement.setAttribute('data-animations', enabled.toString());
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-settings" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-tabs">
            <button 
              className={`tab ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <Palette size={20} />
              Appearance
            </button>
            <button 
              className={`tab ${activeTab === 'export' ? 'active' : ''}`}
              onClick={() => setActiveTab('export')}
            >
              <Download size={20} />
              Export
            </button>
            <button 
              className={`tab ${activeTab === 'shortcuts' ? 'active' : ''}`}
              onClick={() => setActiveTab('shortcuts')}
            >
              <Keyboard size={20} />
              Shortcuts
            </button>
            <button 
              className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              <Search size={20} />
              Advanced
            </button>
          </div>

          <div className="settings-panel">
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <div className="setting-group">
                  <h3>Theme</h3>
                  <div className="theme-options">
                    {themes.map(({ id, name, icon: Icon }) => (
                      <button
                        key={id}
                        className={`theme-option ${theme === id ? 'active' : ''}`}
                        onClick={() => handleThemeChange(id)}
                      >
                        <Icon size={20} />
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-group">
                  <h3>Color Scheme</h3>
                  <div className="color-schemes">
                    {colorSchemes.map(({ id, name, colors }) => (
                      <button
                        key={id}
                        className={`color-scheme ${colorScheme === id ? 'active' : ''}`}
                        onClick={() => handleColorSchemeChange(id)}
                      >
                        <div 
                          className="color-preview"
                          style={{
                            background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`
                          }}
                        />
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-group">
                  <h3>Font Size</h3>
                  <div className="font-sizes">
                    {fontSizes.map(({ id, name, size }) => (
                      <button
                        key={id}
                        className={`font-size ${fontSize === id ? 'active' : ''}`}
                        onClick={() => handleFontSizeChange(id)}
                        style={{ fontSize: size }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-group">
                  <h3>Interface</h3>
                  <div className="toggle-options">
                    <label className="toggle-option">
                      <input
                        type="checkbox"
                        checked={animationsEnabled}
                        onChange={(e) => handleAnimationsChange(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      Enable Animations
                    </label>
                    <label className="toggle-option">
                      <input
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={(e) => setSoundEnabled(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      Sound Effects
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="settings-section">
                <div className="setting-group">
                  <h3>Export Options</h3>
                  <div className="export-buttons">
                    <button className="export-btn" onClick={exportAllChats}>
                      <Download size={20} />
                      Export All Chats
                    </button>
                  </div>
                </div>

                <div className="setting-group">
                  <h3>Data Management</h3>
                  <div className="toggle-options">
                    <label className="toggle-option">
                      <input
                        type="checkbox"
                        checked={autoSave}
                        onChange={(e) => setAutoSave(e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                      Auto-save Chats
                    </label>
                  </div>
                  <button 
                    className="danger-btn"
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all chats? This cannot be undone.')) {
                        clearAllChats();
                      }
                    }}
                  >
                    Clear All Chats
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="settings-section">
                <div className="setting-group">
                  <h3>Keyboard Shortcuts</h3>
                  <div className="shortcuts-list">
                    {shortcuts.map(({ key, action }, index) => (
                      <div key={index} className="shortcut-item">
                        <span className="shortcut-key">{key}</span>
                        <span className="shortcut-action">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="settings-section">
                <div className="setting-group">
                  <h3>Performance</h3>
                  <div className="toggle-options">
                    <label className="toggle-option">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                      />
                      <span className="toggle-slider"></span>
                      Keyword Highlighting
                    </label>
                    <label className="toggle-option">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                      />
                      <span className="toggle-slider"></span>
                      Message Caching
                    </label>
                  </div>
                </div>

                <div className="setting-group">
                  <h3>About</h3>
                  <div className="about-info">
                    <p><strong>EasyWalker AI</strong></p>
                    <p>Version 2.0.0</p>
                    <p>Built with React & Vite</p>
                    <p>Powered by Google Gemini</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;