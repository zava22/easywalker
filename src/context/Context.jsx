import React, { createContext, useState, useEffect, useRef } from "react";
import generateGeminiResponse from "../../src/config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [stopped, setStopped] = useState(false);
    
    // Система чатов
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Изображения
    const [attachedImages, setAttachedImages] = useState([]);
    const [imageData, setImageData] = useState([]);

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

    // Сохранение чатов в localStorage
    useEffect(() => {
        if (chats.length > 0) {
            localStorage.setItem("chats", JSON.stringify(chats));
        }
    }, [chats]);

    const getCurrentChat = () => {
        return chats.find(chat => chat.id === currentChatId);
    };

    const delayPara = (index, nextWord, total, messageId) => {
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
        }, 30 * index);
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

        try {
            // Получаем контекст разговора
            const currentChat = chats.find(c => c.id === chatId);
            const conversationHistory = currentChat ? currentChat.messages : [];
            
            // Формируем контекст для AI
            let contextPrompt = "";
            if (conversationHistory.length > 0) {
                contextPrompt = "Previous conversation:\n";
                conversationHistory.forEach(msg => {
                    if (msg.role === "user") {
                        contextPrompt += `User: ${msg.content}\n`;
                    } else if (msg.role === "assistant" && msg.content) {
                        contextPrompt += `Assistant: ${msg.content}\n`;
                    }
                });
                contextPrompt += `\nCurrent question: ${query}`;
            } else {
                contextPrompt = query;
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
            let words = newResponse2.split(" ");
            words.forEach((word, i) => delayPara(i, word + " ", words.length, aiMessageId));

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
        chats,
        currentChatId,
        getCurrentChat,
        createNewChat,
        deleteChat,
        selectChat,
        sidebarOpen,
        setSidebarOpen
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;