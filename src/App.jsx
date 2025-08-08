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