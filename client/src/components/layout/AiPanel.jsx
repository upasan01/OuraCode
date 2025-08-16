import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import MarkdownRenderer from "./MarkdownRenderer";
import PromptTemplate from "./PromptTemplate";
import { X, ArrowUp, Square } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

// Panel Configuration Constants
const DEFAULT_PANEL_WIDTH = 600;
const MIN_PANEL_WIDTH = 400;
const MAX_PANEL_WIDTH = 800;

/**
 * Chat message vibe check - this is what each message looks like
 * @typedef {Object} ChatMessage
 * @property {string} id - uuid that slaps different 
 * @property {'user'|'ai'} role - who's talking rn
 * @property {string} text - the actual tea ☕
 * @property {'pending'|'done'|'error'} [status] - current mood
 * @property {number} [timestamp] - when this happened
 * @property {string} [prompt] - backup prompt for when we need to retry (big brain move)
 */

// backup id generator when uuid decides to be sus
const uid = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

const AiPanel = forwardRef(({
    isOpen,
    onClose,
    code,
    selectedLanguage,
    setCode,
    isLoading
}, ref) => {
    // all the chat state that matters 💬
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeRequestCount, setActiveRequestCount] = useState(0);
    const [currentChatRequestId, setCurrentChatRequestId] = useState(null);
    const [retryingMessageIds, setRetryingMessageIds] = useState(new Set());

    // panel sizing things ↔️
    const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
    const isResizing = useRef(false);
    const chatContainerRef = useRef(null);
    
    // keeping track of requests so we can yeet them if needed 🗑️
    const activeRequestsRef = useRef(new Map()); // Map<requestId, AbortController>

    // let parent component trigger review (main character energy)
    useImperativeHandle(ref, () => ({
        triggerReview: () => handleReview()
    }));

    // auto scroll like a good chat app should 📱
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isChatLoading]);

    // keep this ref synced bc async is wild sometimes
    const chatHistoryRef = useRef([]);
    useEffect(() => {
        chatHistoryRef.current = chatHistory;
    }, [chatHistory]);

    // id generator that actually works 💪
    const makeId = () => (typeof uuidv4 === 'function' ? uuidv4() : uid());

    // add message to chat (and keep refs happy)
    const pushMessage = (msg) => {
        setChatHistory((prev) => {
            const next = [...prev, msg];
            chatHistoryRef.current = next;
            return next;
        });
    };

    // update specific message when AI responds or errors out
    const updateMessageById = (id, patch) => {
        setChatHistory((prev) => {
            const next = prev.map(m => (m.id === id ? { ...m, ...patch } : m));
            chatHistoryRef.current = next;
            return next;
        });
    };

    // retry failed messages (because we don't give up) 💪
    const retryMessageById = async (messageId) => {
        const message = chatHistoryRef.current.find(m => m.id === messageId);
        if (!message || message.role !== 'ai') {
            console.error("Can't retry: not found or not AI");
            return;
        }
        
        if (!message.prompt) {
            console.error("Can't retry: no prompt saved");
            updateMessageById(messageId, {
                text: "Error: Can't retry - no prompt stored 🤷‍♀️",
                status: "error"
            });
            return;
        }

        // no double retries allowed 🚫
        if (retryingMessageIds.has(messageId)) {
            console.log("Already retrying message:", messageId);
            return;
        }

        console.log("Retrying message:", messageId);

        // mark as retrying
        setRetryingMessageIds(prev => new Set(prev).add(messageId));

        // reset to pending state
        updateMessageById(messageId, {
            text: "",
            status: "pending"
        });

        try {
            const resultText = await callGeminiAPI(message.prompt, messageId);
            
            // make sure message still exists (race conditions are real)
            if (chatHistoryRef.current.find(m => m.id === messageId)) {
                updateMessageById(messageId, {
                    text: resultText,
                    status: "done"
                });
                console.log("Retry successful for message:", messageId);
            }
        } catch (err) {
            console.error("Retry failed for message:", messageId, err);
            
            // update with error if message still exists
            if (chatHistoryRef.current.find(m => m.id === messageId)) {
                updateMessageById(messageId, {
                    text: `Error: ${err.message} 😵`,
                    status: "error"
                });
            }
        } finally {
            // remove from retrying set
            setRetryingMessageIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(messageId);
                return newSet;
            });
        }
    };

    // cancel specific request (for when you change your mind) ❌
    const cancelRequestById = (requestId) => {
        const abortController = activeRequestsRef.current.get(requestId);
        if (abortController) {
            abortController.abort();
            activeRequestsRef.current.delete(requestId);
            setActiveRequestCount(activeRequestsRef.current.size);
            console.log(`Cancelled request: ${requestId}`);
        }
    };

    // nuclear option - cancel everything 💥
    const cancelAllRequests = () => {
        console.log(`Cancelling ${activeRequestsRef.current.size} active requests`);
        activeRequestsRef.current.forEach((abortController, requestId) => {
            abortController.abort();
            console.log(`Cancelled request: ${requestId}`);
        });
        activeRequestsRef.current.clear();
        setActiveRequestCount(0);
    };

    // check if request is still running
    const isRequestActive = (requestId) => {
        return activeRequestsRef.current.has(requestId);
    };



    // panel resize magic ↔️
    const handleMouseDown = (e) => {
        e.preventDefault();
        isResizing.current = true;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!isResizing.current) return;

        requestAnimationFrame(() => {
            const newWidth = window.innerWidth - e.clientX;
            const maxAllowedWidth = window.innerWidth - 256 - 400;
            const clampedWidth = Math.max(MIN_PANEL_WIDTH, Math.min(newWidth, MAX_PANEL_WIDTH, maxAllowedWidth));
            setPanelWidth(clampedWidth);
        });
    };

    const handleMouseUp = () => {
        isResizing.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    // clean up when panel closes
    useEffect(() => {
        if (!isOpen && activeRequestCount > 0) {
            console.log("Panel closed, cancelling all active requests");
            cancelAllRequests();
        }
    }, [isOpen, activeRequestCount]);

    // cleanup when component goes bye bye 👋
    useEffect(() => {
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            // cancel everything when we unmount
            cancelAllRequests();
        };
    }, []);


    // the real MVP - talks to gemini with cancel support 🧠
    const callGeminiAPI = async (prompt, requestId) => {
        const apiKey = import.meta.env.VITE_GENAI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

        // create abort controller for this specific request
        const abortController = new AbortController();
        
        // track this request so we can cancel it later
        if (requestId) {
            activeRequestsRef.current.set(requestId, abortController);
            setActiveRequestCount(activeRequestsRef.current.size);
        }

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: abortController.signal // this is what makes cancellation work 🎯
            });

            // check if request got yeeted mid-way
            if (abortController.signal.aborted) {
                throw new Error("Request was cancelled");
            }

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} - ${errorBody.error?.message || "Unknown error"}`);
            }

            const result = await response.json();
            const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("Invalid response structure from API.");
            
            return text;
        } catch (error) {
            // handle cancellation like a pro 😎
            if (error.name === 'AbortError' || error.message === 'Request was cancelled') {
                console.log(`Request ${requestId} was cancelled`);
                throw new Error("Request was cancelled");
            }
            throw error;
        } finally {
            // clean up our tracking mess
            if (requestId) {
                activeRequestsRef.current.delete(requestId);
                setActiveRequestCount(activeRequestsRef.current.size);
            }
        }
    };

    // handle code review (the main feature) 🔍
    const handleReview = async () => {
        if (!code.trim()) {
            setError("Please enter some code to review.");
            return;
        }

        setError(null);
        const prompt = PromptTemplate.getReviewPrompt(selectedLanguage.value, code);
        
        // create messages with unique IDs (no more race conditions)
        const userMessageId = makeId();
        const aiMessageId = makeId();
        
        const userMessage = {
            id: userMessageId,
            role: "user",
            text: `Please review the following ${selectedLanguage.name} code.`,
            timestamp: Date.now()
        };
        
        const aiMessage = {
            id: aiMessageId,
            role: "ai",
            text: "",
            status: "pending",
            timestamp: Date.now(),
            prompt: prompt
        };

        // add both messages at once (no race conditions allowed) 🏁
        pushMessage(userMessage);
        pushMessage(aiMessage);

        try {
            const resultText = await callGeminiAPI(prompt, aiMessageId);
            
            // make sure message still exists (async is wild)
            if (chatHistoryRef.current.find(m => m.id === aiMessageId)) {
                updateMessageById(aiMessageId, {
                    text: resultText,
                    status: "done"
                });
            }
        } catch (err) {
            console.error("Review API Error:", err);
            setError(err.message);
            
            // update with error if message still exists
            if (chatHistoryRef.current.find(m => m.id === aiMessageId)) {
                updateMessageById(aiMessageId, {
                    text: `Error: ${err.message} 😔`,
                    status: "error"
                });
            }
        }
    };

    // handle chat submissions (the fun part) 💬
    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        const userInput = chatInput;
        setChatInput("");
        setIsChatLoading(true);

        // create messages with unique IDs (consistency is key) 🔑
        const userMessageId = makeId();
        const aiMessageId = makeId();
        
        // track this chat for cancellation purposes
        setCurrentChatRequestId(aiMessageId);
        
        const userMessage = {
            id: userMessageId,
            role: "user",
            text: userInput,
            timestamp: Date.now()
        };

        // build prompt first so we can save it for retries
        const prompt = PromptTemplate.getChatPrompt({
            language: selectedLanguage.value,
            code,
            chatHistory: [...chatHistoryRef.current, userMessage], // use ref for latest state
            chatInput: userInput,
        });
        
        const aiMessage = {
            id: aiMessageId,
            role: "ai",
            text: "",
            status: "pending",
            timestamp: Date.now(),
            prompt: prompt // save prompt for retry magic ✨
        };

        // add both messages at once (race conditions = not today)
        pushMessage(userMessage);
        pushMessage(aiMessage);

        try {
            const resultText = await callGeminiAPI(prompt, aiMessageId);
            
            // make sure message still exists (async safety first)
            if (chatHistoryRef.current.find(m => m.id === aiMessageId)) {
                updateMessageById(aiMessageId, {
                    text: resultText,
                    status: "done"
                });
            }
        } catch (err) {
            console.error("Chat API Error:", err);
            
            // update with error if message still exists
            if (chatHistoryRef.current.find(m => m.id === aiMessageId)) {
                updateMessageById(aiMessageId, {
                    text: `Sorry, I encountered an error: ${err.message} 😅`,
                    status: "error"
                });
            }
        } finally {
            setIsChatLoading(false);
            setCurrentChatRequestId(null);
        }
    };

    // send/cancel button handler (the ChatGPT vibes) ✨
    const handleSendCancelClick = (e) => {
        if (isChatLoading && currentChatRequestId) {
            // cancel mode - stop that request right now 🛑
            e.preventDefault();
            cancelRequestById(currentChatRequestId);
            updateMessageById(currentChatRequestId, {
                text: "Request was cancelled 🚫",
                status: "error"
            });
            setIsChatLoading(false);
            setCurrentChatRequestId(null);
        } else {
            // send mode - let the form handle it 📤
            return;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="flex flex-shrink-0">
            <div onMouseDown={handleMouseDown} className="w-1 bg-[#313244] cursor-col-resize hover:bg-[#f38ba8] z-10 transition-colors" />
            <div className=" border-l border-[#313244] flex flex-col z-10" style={{ width: panelWidth }}>
                <div className="h-14 bg-[#181825] border-b border-[#313244] flex items-center justify-between px-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#a6e3a1] rounded-full animate-pulse" />
                        <h3 className="font-semibold text-[#a6e3a1]">Goonology AI</h3>
                        {activeRequestCount > 0 && (
                            <span className="text-xs text-[#6c7086] bg-[#313244] px-2 py-1 rounded">
                                {activeRequestCount} active
                            </span>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-[#313244]">
                        <X size={16} />
                    </Button>
                </div>
                <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
                    {error && (
                        <div className="bg-red-900/50 text-red-300 p-4 rounded-md mb-4">
                            <p className="font-bold">An error occurred:</p>
                            <p className="mt-1 text-sm">{error}</p>
                        </div>
                    )}
                    {chatHistory.length === 0 && !isLoading && !error && (
                        <div className="flex justify-center items-center h-full text-center">
                            <p className="text-[#6c7086]">Analyze your code or start a conversation.</p>
                        </div>
                    )}
                    <div className="space-y-2">
                        {chatHistory.map((msg) => (
                            <div key={msg.id || `fallback-${msg.role}-${msg.timestamp || Date.now()}`} className={`py-3 px-4 ${msg.role === "user" ? "bg-transparent" : "bg-transparent"}`}>
                                <div className={`${msg.role === "user" ? "ml-auto max-w-[75%] bg-[#242431] text-[#ffffff] px-4 py-3 rounded-3xl" : "max-w-[85%] bg-[#1e1e2e] text-[#ffffff] px-4 py-3 rounded-3xl"}`}>
                                    <p
                                        className={`text-xs opacity-90 mb-2 font-medium ${msg.role === "user" ? "text-gray-400" : "text-[#a6e3a1]"
                                            }`}
                                    >
                                        {msg.role === "user" ? "You" : "GoonologyAI"}
                                        {msg.status === "error" && (
                                            <span className="ml-2 text-red-400 text-xs">[Error]</span>
                                        )}
                                    </p>

                                    {msg.text ? (
                                        <div>
                                            <MarkdownRenderer text={msg.text} onUseCode={(newCode) => setCode(newCode)} />
                                            {msg.status === "error" && msg.role === "ai" && (
                                                <Button
                                                    onClick={() => retryMessageById(msg.id)}
                                                    size="sm"
                                                    variant="ghost"
                                                    className="mt-2 text-[#f38ba8] hover:bg-[#f38ba8]/10"
                                                    disabled={retryingMessageIds.has(msg.id) || isRequestActive(msg.id)}
                                                >
                                                    {retryingMessageIds.has(msg.id) || isRequestActive(msg.id) ? "Retrying..." : "Retry"}
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-[#a1a1a1] animate-pulse flex items-center gap-2">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-[#a1a1a1] rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-[#a1a1a1] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-[#a1a1a1] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                            <span>
                                                {msg.status === "pending" ? "Thinking..." : "Loading..."}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-[#313244] flex-shrink-0 ">
                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                        <Input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask about your code..."
                            className="bg-[#11111b] border-[#313244] rounded-lg text-[#cdd6f4] placeholder:text-[#6c7086]"
                            disabled={isLoading}
                        />
                        <Button 
                            type={isChatLoading ? "button" : "submit"}
                            size="icon" 
                            onClick={isChatLoading ? handleSendCancelClick : undefined}
                            disabled={(!isChatLoading && !chatInput.trim()) || isLoading}
                            className={`transition-all duration-300 ease-in-out transform hover:scale-105 ${
                                isChatLoading 
                                    ? "bg-[#f38ba8] hover:bg-[#f38ba8]/80 text-white shadow-lg animate-pulse" 
                                    : "bg-[#f0f6ef] hover:bg-[#a6e3a1]/80 text-[#1e1e2e]"
                            }`}
                        >
                            <div className={`transition-all duration-300 ease-in-out ${
                                isChatLoading ? "scale-110" : "scale-100"
                            }`}>
                                {isChatLoading ? (
                                    <Square size={14} className="transition-all duration-300 ease-in-out" />
                                ) : (
                                    <ArrowUp size={16} className="transition-all duration-300 ease-in-out" />
                                )}
                            </div>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
});

export default AiPanel;
