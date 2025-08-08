import React, { useContext } from 'react';
import './Sidebar.css';
import { Context } from '../../context/Context';
import { Folder } from 'lucide-react';

const Sidebar = () => {
    const {
        chats,
        currentChatId,
        createNewChat,
        deleteChat,
        selectChat,
        sidebarOpen,
        setSidebarOpen,
        categories,
        assignChatToCategory
    } = useContext(Context);

    const handleDeleteChat = (e, chatId) => {
        e.stopPropagation();
        deleteChat(chatId);
    };

    const getCategoryById = (categoryId) => {
        return categories.find(cat => cat.id === categoryId);
    };

    const groupChatsByCategory = () => {
        const grouped = {
            uncategorized: chats.filter(chat => !chat.categoryId)
        };
        
        categories.forEach(category => {
            grouped[category.id] = chats.filter(chat => chat.categoryId === category.id);
        });
        
        return grouped;
    };

    const groupedChats = groupChatsByCategory();

    return (
        <>
            <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2 className="sidebar-title">EasyWalker AI</h2>
                    <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
                        ×
                    </button>
                </div>

                <button className="new-chat-btn" onClick={createNewChat}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    New Chat
                </button>

                <div className="chats-section">
                    <h3 className="chats-title">Recent Chats</h3>
                    {chats.length > 0 ? (
                        <div className="chats-by-category">
                            {/* Uncategorized chats */}
                            {groupedChats.uncategorized.length > 0 && (
                                <div className="category-group">
                                    <div className="category-header">
                                        <Folder size={16} />
                                        <span>Uncategorized</span>
                                        <span className="chat-count">({groupedChats.uncategorized.length})</span>
                                    </div>
                                    {groupedChats.uncategorized.map((chat) => (
                                        <div
                                            key={chat.id}
                                            className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
                                            onClick={() => selectChat(chat.id)}
                                        >
                                            <div className="chat-content">
                                                <div className="chat-icon">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                </div>
                                                <span className="chat-title">{chat.title}</span>
                                            </div>
                                            <button
                                                className="delete-chat-btn"
                                                onClick={(e) => handleDeleteChat(e, chat.id)}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Categorized chats */}
                            {categories.map(category => (
                                groupedChats[category.id] && groupedChats[category.id].length > 0 && (
                                    <div key={category.id} className="category-group">
                                        <div className="category-header">
                                            <div 
                                                className="category-color-dot"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <span>{category.name}</span>
                                            <span className="chat-count">({groupedChats[category.id].length})</span>
                                        </div>
                                        {groupedChats[category.id].map((chat) => (
                                            <div
                                                key={chat.id}
                                                className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
                                                onClick={() => selectChat(chat.id)}
                                            >
                                                <div className="chat-content">
                                                    <div className="chat-icon">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                        </svg>
                                                    </div>
                                                    <span className="chat-title">{chat.title}</span>
                                                </div>
                                                <button
                                                    className="delete-chat-btn"
                                                    onClick={(e) => handleDeleteChat(e, chat.id)}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ))}
                        </div>
                    ) : (
                        <div className="no-chats">No chats yet. Start a new conversation!</div>
                    )}
                </div>

                <div className="sidebar-bottom">
                    <div className="bottom-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Settings
                    </div>
                    <div className="bottom-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <path d="M12 17h.01" />
                        </svg>
                        Help & FAQ
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;