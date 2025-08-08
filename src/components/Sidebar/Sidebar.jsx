import React, { useState, useContext, useEffect } from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';

const Sidebar = () => {
    const { newChat } = useContext(Context);
    const [extended, setExtended] = useState(false);
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchHistory, setSearchHistory] = useState([]);
    const { prevPrompts,setPrevPrompts ,loadPrevPrompt } = useContext(Context);
    const [menuOpen, setMenuOpen] = useState(null);

    useEffect(() => {
        const savedHistory = localStorage.getItem("searchHistory");
        if (savedHistory) {
            setSearchHistory(JSON.parse(savedHistory));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    }, [searchHistory]);

    const handleDeleteRecent = (idx) => {
        const updated = prevPrompts.filter((_, i) => i !== idx);
        setPrevPrompts(updated); // обновляем в контексте сразу
        localStorage.setItem("prevPrompts", JSON.stringify(updated));
        setMenuOpen(null);
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        if (value.trim() && !searchHistory.includes(value)) {
            setSearchHistory(prev => [...prev, value]);
        }
    };

    const filteredPrompts = prevPrompts.filter(item =>
        item.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className='sidebar'>
            <div className="top">
                <img
                    className='menu'
                    src={assets.menu_icon}
                    alt="Menu"
                    onClick={() => setExtended(prev => !prev)}
                />

                <div className="new-chat" onClick={newChat}>
                    <img src={assets.plus_icon} alt="New Chat" />
                    {extended && <p>New Chat</p>}
                </div>

                <div
                    className="search-btn"
                    onClick={() => setSearchVisible(prev => !prev)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className="feather feather-search">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    {extended && <p>Search</p>}
                </div>

                {searchVisible && extended && (
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search recent..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                )}

                {extended && (
                    <div className="recent">
                        <p className="recent-title">Recent</p>
                        {filteredPrompts.length > 0 ? (
                            filteredPrompts.map((item, index) => (
                                <div
                                    className="recent-entry"
                                    key={index}
                                    onMouseLeave={() => setMenuOpen(null)}
                                >
                                    <div
                                        className="recent-text"
                                        onClick={() => loadPrevPrompt(item)}
                                    >
                                        <img src={assets.message_icon} alt="Recent" />
                                        <p>
                                            {item.prompt.length > 25
                                                ? item.prompt.slice(0, 25) + "..."
                                                : item.prompt}
                                        </p>
                                    </div>

                                    <button
                                        className="delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteRecent(index);
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="no-results">No results found</p>
                        )}

                    </div>
                )}
            </div>

            <div className="bottom">
                <div className="bottom-item recent-entry">
                    <img src={assets.question_icon} alt="Help" />
                    {extended && <p>Help</p>}
                </div>
                <div className="bottom-item recent-entry">
                    <img src={assets.history_icon} alt="Activity" />
                    {extended && <p>Activity</p>}
                </div>
                <div className="bottom-item recent-entry">
                    <img src={assets.setting_icon} alt="Settings" />
                    {extended && <p>Settings</p>}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
