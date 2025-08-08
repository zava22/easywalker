import React, { useContext, useState, useEffect } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Main from './components/Main/Main'
import { Context } from './context/Context'
import Settings from './components/Settings/Settings'
import SearchModal from './components/SearchModal/SearchModal'
import CategoryModal from './components/CategoryModal/CategoryModal'
import ShortcutsModal from './components/ShortcutsModal/ShortcutsModal'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

const App = () => {
  const { sidebarOpen, theme, fontSize, colorScheme, animationsEnabled } = useContext(Context);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts(setSettingsOpen, setSearchOpen, setCategoryOpen, setShortcutsOpen);

  // Apply theme and settings to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font-size', fontSize);
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
    document.documentElement.setAttribute('data-animations', animationsEnabled.toString());
    
    // Apply theme-specific body styles
    const applyThemeStyles = () => {
      if (theme === 'light') {
        document.body.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 15%, #e2e8f0 35%, #cbd5e1 60%, #94a3b8 85%, #64748b 100%)';
        document.body.style.color = '#1e293b';
      } else if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.body.style.background = 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 25%, #2d1b69 50%, #1e3a8a 75%, #0f172a 100%)';
          document.body.style.color = 'white';
        } else {
          document.body.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 15%, #e2e8f0 35%, #cbd5e1 60%, #94a3b8 85%, #64748b 100%)';
          document.body.style.color = '#1e293b';
        }
      } else {
        document.body.style.background = 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 25%, #2d1b69 50%, #1e3a8a 75%, #0f172a 100%)';
        document.body.style.color = 'white';
      }
    };
    
    applyThemeStyles();
    
    // Listen for system theme changes when auto theme is selected
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyThemeStyles();
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme, fontSize, colorScheme, animationsEnabled]);

  // Listen for custom events from header buttons
  useEffect(() => {
    const handleOpenSettings = () => setSettingsOpen(true);
    const handleOpenSearch = () => setSearchOpen(true);
    const handleOpenCategories = () => setCategoryOpen(true);
    const handleOpenShortcuts = () => setShortcutsOpen(true);

    window.addEventListener('openSettings', handleOpenSettings);
    window.addEventListener('openSearch', handleOpenSearch);
    window.addEventListener('openCategories', handleOpenCategories);
    window.addEventListener('openShortcuts', handleOpenShortcuts);

    return () => {
      window.removeEventListener('openSettings', handleOpenSettings);
      window.removeEventListener('openSearch', handleOpenSearch);
      window.removeEventListener('openCategories', handleOpenCategories);
      window.removeEventListener('openShortcuts', handleOpenShortcuts);
    };
  }, []);

  // Close modals on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (shortcutsOpen) setShortcutsOpen(false);
        else if (categoryOpen) setCategoryOpen(false);
        else if (searchOpen) setSearchOpen(false);
        else if (settingsOpen) setSettingsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [settingsOpen, searchOpen, categoryOpen, shortcutsOpen]);

  return (
    <div className="app">
      <Sidebar />
      <Main />
      
      <Settings 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
      
      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />
      
      <CategoryModal 
        isOpen={categoryOpen} 
        onClose={() => setCategoryOpen(false)} 
      />
      
      <ShortcutsModal 
        isOpen={shortcutsOpen} 
        onClose={() => setShortcutsOpen(false)} 
      />
    </div>
  )
}

export default App