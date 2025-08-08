import React, { createContext, useState, useEffect, useRef } from "react";
import generateGeminiResponse from "../../src/config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [resultData, setResultData] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [recentPrompt, setRecentPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [stopped, setStopped] = useState(false);

    // фото для текущего ввода (превью)
    const [attachedImages, setAttachedImages] = useState([]);
    const [imageData, setImageData] = useState([]); // [{ base64, mime }]

    const timers = useRef([]);

    useEffect(() => {
        const savedPrompts = localStorage.getItem("prevPrompts");
        if (savedPrompts) {
            setPrevPrompts(JSON.parse(savedPrompts));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("prevPrompts", JSON.stringify(prevPrompts));
    }, [prevPrompts]);

    const delayPara = (index, nextWord, total) => {
        const t = setTimeout(() => {
            if (!stopped) {
                setResultData(prev => prev + nextWord);
            }
            if (index === total - 1) {
                setIsGenerating(false);
            }
        }, 40 * index);
        timers.current.push(t);
    };

    const stopGenerating = () => {
        setStopped(true);
        timers.current.forEach(t => clearTimeout(t));
        timers.current = [];
        setIsGenerating(false);
        setLoading(false);
        setInput("");
    };

    const onSent = async (prompt) => {
        const query = prompt || input;
        if (!query.trim() && (!imageData || !imageData.length)) return;

        setShowResult(true);
        setResultData("");
        setRecentPrompt(query);
        setLoading(true);
        setIsGenerating(true);
        setStopped(false);
        timers.current = [];

        try {
            const response = await generateGeminiResponse(query, imageData);

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

            let words = newResponse2.split(" ");
            words.forEach((word, i) => delayPara(i, word + " ", words.length));

            // Сохраняем в историю с base64 (чтобы работало после перезагрузки)
            setPrevPrompts(prev => [
                {
                    prompt: query,
                    response: newResponse2,
                    images: imageData.map(img => `data:${img.mime};base64,${img.base64}`)
                },
                ...prev
            ]);

        } catch (error) {
            console.error("Ошибка при запросе к AI:", error);
            setResultData("Произошла ошибка. Попробуйте снова.");
            setIsGenerating(false);
        } finally {
            setLoading(false);
            setInput("");
            setAttachedImages([]); // очищаем превью
            setImageData([]);
        }
    };

    const loadPrevPrompt = (item) => {
        setRecentPrompt(item.prompt);
        setResultData(item.response);
        setShowResult(true);
    };

    const newChat = () => {
        setInput("");
        setResultData("");
        setShowResult(false);
        setRecentPrompt("");
        setAttachedImages([]);
        setImageData([]);
    };

    const contextValue = {
        input,
        setInput,
        resultData,
        onSent,
        showResult,
        loading,
        recentPrompt,
        prevPrompts,
        setPrevPrompts, 
        loadPrevPrompt,
        newChat,
        stopGenerating,
        isGenerating,
        attachedImages,
        setAttachedImages,
        imageData,
        setImageData
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;
