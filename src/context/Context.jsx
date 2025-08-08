import React, { createContext, useState, useEffect, useRef } from "react";
import generateGeminiResponse from "../../src/config/gemini";
import { exportToPDF, exportToMarkdown, exportToTXT } from "../utils/exportUtils";

const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [stopped, setStopped] = useState(false);

    // Система чатов
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Изображения и файлы
    const [attachedImages, setAttachedImages] = useState([]);
    const [imageData, setImageData] = useState([]);
    const [attachedFiles, setAttachedFiles] = useState([]);

    // Settings
    const [theme, setTheme] = useState('dark');
    const [fontSize, setFontSize] = useState('medium');
    const [colorScheme, setColorScheme] = useState('purple');
    const [autoSave, setAutoSave] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [animationsEnabled, setAnimationsEnabled] = useState(true);

    // Categories
    const [categories, setCategories] = useState([]);

    // Prompt Templates
    const [promptTemplates, setPromptTemplates] = useState([]);

    // AI Personality
    const [aiPersonality, setAiPersonality] = useState({
        preset: 'friendly',
        tone: 'casual',
        style: 'detailed',
        expertise: 'general',
        customInstructions: ''
    });

    const timers = useRef([]);

    // Загрузка чатов из localStorage
    useEffect(() => {
        const savedChats = localStorage.getItem("chats");
        if (savedChats) {
            const parsedChats = JSON.parse(savedChats);
            setChats(parsedChats);
            if (parsedChats.length > 0) {
                setCurrentChatId(parsedChats[0].id);
            }
        }
    }, []);

    // Load categories from localStorage
    useEffect(() => {
        const savedCategories = localStorage.getItem("categories");
        if (savedCategories) {
            setCategories(JSON.parse(savedCategories));
        }
    }, []);

    // Load prompt templates from localStorage
    useEffect(() => {
        const savedTemplates = localStorage.getItem("promptTemplates");
        if (savedTemplates) {
            setPromptTemplates(JSON.parse(savedTemplates));
        }
    }, []);

    // Load AI personality from localStorage
    useEffect(() => {
        const savedPersonality = localStorage.getItem("aiPersonality");
        if (savedPersonality) {
            setAiPersonality(JSON.parse(savedPersonality));
        }
    }, []);

    // Load settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem("settings");
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            setTheme(settings.theme || 'dark');
            setFontSize(settings.fontSize || 'medium');
            setColorScheme(settings.colorScheme || 'purple');
            setAutoSave(settings.autoSave !== undefined ? settings.autoSave : true);
            setSoundEnabled(settings.soundEnabled || false);
            setAnimationsEnabled(settings.animationsEnabled !== undefined ? settings.animationsEnabled : true);
        }
    }, []);

    // Apply theme and settings to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-font-size', fontSize);
        document.documentElement.setAttribute('data-color-scheme', colorScheme);
        document.documentElement.setAttribute('data-animations', animationsEnabled.toString());

        // Apply theme-specific styles
        if (theme === 'light') {
            document.body.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%)';
            document.body.style.color = '#1e293b';
        } else {
            document.body.style.background = 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 25%, #2d1b69 50%, #1e3a8a 75%, #0f172a 100%)';
            document.body.style.color = 'white';
        }
    }, [theme, fontSize, colorScheme, animationsEnabled]);

    // Сохранение чатов в localStorage
    useEffect(() => {
        if (chats.length > 0 && autoSave) {
            localStorage.setItem("chats", JSON.stringify(chats));
        }
    }, [chats, autoSave]);

    // Save categories to localStorage
    useEffect(() => {
        if (categories.length > 0) {
            localStorage.setItem("categories", JSON.stringify(categories));
        }
    }, [categories]);

    // Save prompt templates to localStorage
    useEffect(() => {
        localStorage.setItem("promptTemplates", JSON.stringify(promptTemplates));
    }, [promptTemplates]);

    // Save AI personality to localStorage
    useEffect(() => {
        localStorage.setItem("aiPersonality", JSON.stringify(aiPersonality));
    }, [aiPersonality]);

    // Save settings to localStorage
    useEffect(() => {
        const settings = {
            theme,
            fontSize,
            colorScheme,
            autoSave,
            soundEnabled,
            animationsEnabled
        };
        localStorage.setItem("settings", JSON.stringify(settings));
    }, [theme, fontSize, colorScheme, autoSave, soundEnabled, animationsEnabled]);

    const getCurrentChat = () => {
        return chats.find(chat => chat.id === currentChatId);
    };

    const delayPara = (index, nextWord, total, messageId) => {
        const delay = Math.min(15 * index, 500); // Reduced delay and max cap
        const t = setTimeout(() => {
            if (!stopped) {
                setChats(prevChats =>
                    prevChats.map(chat =>
                        chat.id === currentChatId
                            ? {
                                ...chat,
                                messages: chat.messages.map(msg =>
                                    msg.id === messageId
                                        ? { ...msg, content: msg.content + nextWord }
                                        : msg
                                )
                            }
                            : chat
                    )
                );
            }
            if (index === total - 1) {
                setIsGenerating(false);
                setLoading(false);
            }
        }, delay);
        timers.current.push(t);
    };

    const stopGenerating = () => {
        setStopped(true);
        timers.current.forEach(t => clearTimeout(t));
        timers.current = [];
        setIsGenerating(false);
        setLoading(false);
    };

    const createNewChat = () => {
        const newChatId = Date.now().toString();
        const newChat = {
            id: newChatId,
            title: "New Chat",
            messages: [],
            createdAt: new Date().toISOString()
        };

        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChatId);
        setInput("");
        setAttachedImages([]);
        setImageData([]);
        setSidebarOpen(false);
    };

    const deleteChat = (chatId) => {
        setChats(prev => {
            const filtered = prev.filter(chat => chat.id !== chatId);
            if (chatId === currentChatId) {
                if (filtered.length > 0) {
                    setCurrentChatId(filtered[0].id);
                } else {
                    setCurrentChatId(null);
                }
            }
            return filtered;
        });
    };

    const selectChat = (chatId) => {
        setCurrentChatId(chatId);
        setSidebarOpen(false);
    };

    const onSent = async (prompt) => {
        const query = prompt || input;
        if (!query.trim() && (!imageData || !imageData.length)) return;

        // Создаем новый чат если его нет
        let chatId = currentChatId;
        if (!chatId) {
            chatId = Date.now().toString();
            const newChat = {
                id: chatId,
                title: query.length > 30 ? query.substring(0, 30) + "..." : query,
                messages: [],
                createdAt: new Date().toISOString()
            };
            setChats(prev => [newChat, ...prev]);
            setCurrentChatId(chatId);
        }

        // Добавляем сообщение пользователя
        const userMessageId = Date.now().toString();
        const userMessage = {
            id: userMessageId,
            role: "user",
            content: query,
            images: imageData.map(img => `data:${img.mime};base64,${img.base64}`),
            timestamp: new Date().toISOString()
        };

        // Добавляем пустое сообщение AI
        const aiMessageId = (Date.now() + 1).toString();
        const aiMessage = {
            id: aiMessageId,
            role: "assistant",
            content: "",
            timestamp: new Date().toISOString()
        };

        setChats(prevChats =>
            prevChats.map(chat =>
                chat.id === chatId
                    ? {
                        ...chat,
                        title: chat.messages.length === 0 ? (query.length > 30 ? query.substring(0, 30) + "..." : query) : chat.title,
                        messages: [...chat.messages, userMessage, aiMessage]
                    }
                    : chat
            )
        );

        setLoading(true);
        setIsGenerating(true);
        setStopped(false);
        timers.current = [];
        setInput("");
        setAttachedImages([]);
        setImageData([]);
        setAttachedFiles([]);

        try {
            // Получаем контекст разговора
            const currentChat = chats.find(c => c.id === chatId);
            const conversationHistory = currentChat ? currentChat.messages : [];

            // Формируем контекст для AI
            let contextPrompt = "";

            // Add personality context
            const personalityContext = buildPersonalityContext();

            if (conversationHistory.length > 0) {
                contextPrompt = personalityContext + "\n\nPrevious conversation:\n";
                conversationHistory.forEach(msg => {
                    if (msg.role === "user") {
                        contextPrompt += `User: ${msg.content}\n`;
                    } else if (msg.role === "assistant" && msg.content) {
                        contextPrompt += `Assistant: ${msg.content}\n`;
                    }
                });
                contextPrompt += `\nCurrent question: ${query}`;
            } else {
                contextPrompt = personalityContext + "\n\n" + query;
            }

            const response = await generateGeminiResponse(contextPrompt, imageData);

            // Форматирование ответа
            let responseArray = response.split("**");
            let newResponse = "";
            for (let i = 0; i < responseArray.length; i++) {
                if (i % 2 === 1) {
                    newResponse += `<b>${responseArray[i]}</b>`;
                } else {
                    newResponse += responseArray[i];
                }
            }

            newResponse = newResponse.replace(/\*(.*?)\*/g, `<span class="highlight">$1</span>`);
            let newResponse2 = newResponse.split("\n").join("<br/>");

            // Анимированный вывод текста
            const words = newResponse2.split(" ");
            const chunkSize = Math.max(1, Math.floor(words.length / 50)); // Bigger chunks for faster display
            const chunks = [];
            
            for (let i = 0; i < words.length; i += chunkSize) {
                chunks.push(words.slice(i, i + chunkSize).join(" ") + " ");
            }
            
            chunks.forEach((chunk, i) => delayPara(i, chunk, chunks.length, aiMessageId));

        } catch (error) {
            console.error("Ошибка при запросе к AI:", error);
            setChats(prevChats =>
                prevChats.map(chat =>
                    chat.id === chatId
                        ? {
                            ...chat,
                            messages: chat.messages.map(msg =>
                                msg.id === aiMessageId
                                    ? { ...msg, content: "Произошла ошибка. Попробуйте снова." }
                                    : msg
                            )
                        }
                        : chat
                )
            );
            setIsGenerating(false);
            setLoading(false);
        }
    };

    const buildPersonalityContext = () => {
        let context = "You are an AI assistant with the following personality settings:\n";
        context += `- Tone: ${aiPersonality.tone}\n`;
        context += `- Style: ${aiPersonality.style}\n`;
        context += `- Expertise focus: ${aiPersonality.expertise}\n`;

        if (aiPersonality.customInstructions) {
            context += `- Additional instructions: ${aiPersonality.customInstructions}\n`;
        }

        context += "Please respond according to these personality settings.";
        return context;
    };

    // Category management
    const createCategory = (categoryData) => {
        const newCategory = {
            id: Date.now().toString(),
            name: categoryData.name,
            color: categoryData.color,
            createdAt: new Date().toISOString()
        };
        setCategories(prev => [...prev, newCategory]);
        return newCategory.id;
    };

    const updateCategory = (categoryId, updates) => {
        setCategories(prev =>
            prev.map(cat =>
                cat.id === categoryId
                    ? { ...cat, ...updates, updatedAt: new Date().toISOString() }
                    : cat
            )
        );
    };

    const deleteCategory = (categoryId) => {
        // Remove category from chats
        setChats(prev =>
            prev.map(chat =>
                chat.categoryId === categoryId
                    ? { ...chat, categoryId: null }
                    : chat
            )
        );
        // Remove category
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    };

    const assignChatToCategory = (chatId, categoryId) => {
        setChats(prev =>
            prev.map(chat =>
                chat.id === chatId
                    ? { ...chat, categoryId }
                    : chat
            )
        );
    };

    // Export functions
    const exportCurrentChat = () => {
        const currentChat = getCurrentChat();
        if (!currentChat) return;

        const format = prompt("Export format: pdf, markdown, or txt?", "pdf");
        if (!format) return;

        switch (format.toLowerCase()) {
            case 'pdf':
                exportToPDF(currentChat);
                break;
            case 'markdown':
            case 'md':
                exportToMarkdown(currentChat);
                break;
            case 'txt':
            case 'text':
                exportToTXT(currentChat);
                break;
            default:
                alert("Invalid format. Please choose pdf, markdown, or txt.");
        }
    };

    const exportAllChats = () => {
        if (chats.length === 0) {
            alert("No chats to export.");
            return;
        }

        const format = prompt("Export all chats as: pdf, markdown, or txt?", "markdown");
        if (!format) return;

        chats.forEach(chat => {
            switch (format.toLowerCase()) {
                case 'pdf':
                    exportToPDF(chat);
                    break;
                case 'markdown':
                case 'md':
                    exportToMarkdown(chat);
                    break;
                case 'txt':
                case 'text':
                    exportToTXT(chat);
                    break;
            }
        });
    };

    const clearAllChats = () => {
        setChats([]);
        setCurrentChatId(null);
        localStorage.removeItem("chats");
    };

    // Prompt template management
    const createPromptTemplate = (templateData) => {
        const newTemplate = {
            id: Date.now().toString(),
            title: templateData.title,
            content: templateData.content,
            category: templateData.category,
            createdAt: new Date().toISOString()
        };
        setPromptTemplates(prev => [...prev, newTemplate]);
        return newTemplate.id;
    };

    const updatePromptTemplate = (templateId, updates) => {
        setPromptTemplates(prev =>
            prev.map(template =>
                template.id === templateId
                    ? { ...template, ...updates, updatedAt: new Date().toISOString() }
                    : template
            )
        );
    };

    const deletePromptTemplate = (templateId) => {
        setPromptTemplates(prev => prev.filter(template => template.id !== templateId));
    };

    const contextValue = {
        input,
        setInput,
        loading,
        onSent,
        stopGenerating,
        isGenerating,
        attachedImages,
        setAttachedImages,
        imageData,
        setImageData,
        attachedFiles,
        setAttachedFiles,
        chats,
        currentChatId,
        getCurrentChat,
        createNewChat,
        deleteChat,
        selectChat,
        sidebarOpen,
        setSidebarOpen,
        // Settings
        theme,
        setTheme,
        fontSize,
        setFontSize,
        colorScheme,
        setColorScheme,
        autoSave,
        setAutoSave,
        soundEnabled,
        setSoundEnabled,
        animationsEnabled,
        setAnimationsEnabled,
        // Categories
        categories,
        createCategory,
        updateCategory,
        deleteCategory,
        assignChatToCategory,
        // Export
        exportCurrentChat,
        exportAllChats,
        clearAllChats,
        // Prompt Templates
        promptTemplates,
        createPromptTemplate,
        updatePromptTemplate,
        deletePromptTemplate,
        // AI Personality
        aiPersonality,
        setAiPersonality
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export { Context };
export default ContextProvider;
