import { useEffect, useContext } from 'react';
import { Context } from '../context/Context';

export const useKeyboardShortcuts = (
  setSettingsOpen,
  setSearchOpen,
  setCategoryOpen,
  setShortcutsOpen,
  setTemplatesOpen,
  setPersonalityOpen
) => {
  const {
    createNewChat,
    deleteChat,
    currentChatId,
    setSidebarOpen,
    sidebarOpen,
    stopGenerating,
    isGenerating,
    exportCurrentChat
  } = useContext(Context);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Allow Escape to work even in inputs
        if (e.key === 'Escape') {
          if (isGenerating) {
            stopGenerating();
          }
          e.target.blur();
        }
        return;
      }

      // Ctrl/Cmd + key combinations
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            createNewChat();
            break;
          case 'k':
            e.preventDefault();
            setSearchOpen(true);
            break;
          case 'e':
            e.preventDefault();
            if (currentChatId) {
              exportCurrentChat();
            }
            break;
          case 'd':
            e.preventDefault();
            if (currentChatId) {
              if (confirm('Delete current chat?')) {
                deleteChat(currentChatId);
              }
            }
            break;
          case 's':
            e.preventDefault();
            setSidebarOpen(!sidebarOpen);
            break;
          case ',':
            e.preventDefault();
            setSettingsOpen(true);
            break;
          case '/':
            e.preventDefault();
            setShortcutsOpen(true);
            break;
          case 'f':
            e.preventDefault();
            setCategoryOpen(true);
            break;
          case 't':
            e.preventDefault();
            setTemplatesOpen(true);
            break;
          case 'p':
            e.preventDefault();
            setPersonalityOpen(true);
            break;
        }
      }

      // Single key shortcuts
      switch (e.key) {
        case 'Escape':
          if (isGenerating) {
            stopGenerating();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    createNewChat,
    deleteChat,
    currentChatId,
    setSidebarOpen,
    sidebarOpen,
    stopGenerating,
    isGenerating,
    exportCurrentChat,
    setSettingsOpen,
    setSearchOpen,
    setCategoryOpen,
    setShortcutsOpen,
    setTemplatesOpen,
    setPersonalityOpen
  ]);
};