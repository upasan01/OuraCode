import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

// UI Components
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/ScrollArea";
import { Input } from "../components/ui/input";
import { LoadingIcon, EnhanceIcon } from "../components/ui/Icons";
import BackgroundGradientAnimation from "../components/ui/BackgroundGradientAnimation";
import { SiJavascript, SiPython, SiCplusplus, SiC, SiTypescript, SiKotlin } from 'react-icons/si';
import { FaJava, FaRust, FaPhp, FaSwift } from "react-icons/fa"
import { TbBrandCSharp } from "react-icons/tb"
import { FaGolang } from "react-icons/fa6"
import { DiRuby } from "react-icons/di";

// App Components
import CodeEditor from "../components/layout/CodeEditor";
import MarkdownRenderer from "../components/layout/MarkdownRenderer";
import PromptTemplate from "../components/layout/PromptTemplate";
import { toast } from "react-hot-toast";

// Icons
import {
    MessageCircle, X, Code2, ArrowUp, Copy, Check, DownloadIcon, Save, Menu
} from "lucide-react";

// API
import { downloadCode, saveCode, changeLanguage } from '../api/controllerApi';

// Panel Configuration Constants
const DEFAULT_PANEL_WIDTH = 600;
const MIN_PANEL_WIDTH = 400;
const MAX_PANEL_WIDTH = 800;

export default function App() {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId");
    const location = useLocation();
    const { language: initialLanguage } = location.state || {};

    const languages = useMemo(
        () => [
            { id: "c", value: "c", name: "C", icon: SiC, color: "bg-gray-500/20 text-gray-300" },
            { id: "javascript", value: "js", name: "JavaScript", icon: SiJavascript, color: "bg-yellow-500/20 text-yellow-300" },
            { id: "python", value: "py", name: "Python", icon: SiPython, color: "bg-green-500/20 text-green-300" },
            { id: "java", value: "java", name: "Java", icon: FaJava, color: "bg-orange-500/20 text-orange-300" },
            { id: "cpp", value: "cpp", name: "C++", icon: SiCplusplus, color: "bg-purple-500/20 text-purple-300" },
            { id: "csharp", value: "cs", name: "C#", icon: TbBrandCSharp, color: "bg-teal-500/20" },
            { id: "go", value: "go", name: "Go lang", icon: FaGolang, color: "bg-[#00ADD8]/20 text-[#00ADD8]" },
            { id: "rust", value: "rs", name: "Rust", icon: FaRust, color: "bg-orange-600/20 text-orange-400" },
            { id: "typescript", value: "ts", name: "TypeScript", icon: SiTypescript, color: "bg-blue-500/20 text-blue-300" },
            { id: "php", value: "php", name: "PHP", icon: FaPhp, color: "bg-indigo-500/20 text-indigo-300" },
            { id: "ruby", value: "rb", name: "Ruby", icon: DiRuby, color: "bg-red-500/20 text-red-300" },
            { id: "swift", value: "swift", name: "Swift", icon: FaSwift, color: "bg-orange-500/20 text-orange-300" },
            { id: "kotlin", value: "kt", name: "Kotlin", icon: SiKotlin, color: "bg-purple-600/20 text-purple-400" }
        ],
        []
    );

    const defaultLang = languages.find((l) => l.value === initialLanguage) || languages[0];
    const [selectedLanguage, setSelectedLanguage] = useState(defaultLang);
    const [code, setCode] = useState("");

    const [isCopied, setIsCopied] = useState(false);
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy code:", err);
        }
    };

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [isSidebarOpen, setSidebarOpen] = useState(false)
    const [isTerminalOpen, setTerminalOpen] = useState(false)
    const [terminalHeight, setTerminalHeight] = useState(200)
    const [isMobile, setIsMobile] = useState(false)
    const resizeRef = useRef(null)


    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            if (mobile) {
                setSidebarCollapsed(false)
                setSidebarOpen(false)
            }
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])


    const [isChatOpen, setChatOpen] = useState(false);
    const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
    const isResizing = useRef(false);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isChatLoading]);

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

    // The ChatBot call 

    const callGeminiAPI = async (prompt) => {
        const apiKey = import.meta.env.VITE_GENAI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} - ${errorBody.error?.message || "Unknown error"}`);
        }

        const result = await response.json();
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Invalid response structure from API.");
        return text;
    };

    const handleReview = async () => {
        if (!code.trim()) {
            setError("Please enter some code to review.");
            if (!isChatOpen) setChatOpen(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        if (!isChatOpen) setChatOpen(true);

        const prompt = PromptTemplate.getReviewPrompt(selectedLanguage.value, code);
        setChatHistory((prev) => [...prev, { role: "user", text: `Please review the following ${selectedLanguage.name} code.` }, { role: "ai", text: "" }]);

        try {
            const resultText = await callGeminiAPI(prompt);
            setChatHistory((prev) => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { role: "ai", text: resultText };
                return newHistory;
            });
        } catch (err) {
            console.error(err);
            setError(err.message);
            setChatHistory((prev) => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { role: "ai", text: `Error: ${err.message}` };
                return newHistory;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        const newUserMessage = { role: "user", text: chatInput };
        setChatHistory((prev) => [...prev, newUserMessage, { role: "ai", text: "" }]);
        setIsChatLoading(true);
        setChatInput("");

        const prompt = PromptTemplate.getChatPrompt({
            language: selectedLanguage.value, code, chatHistory: [...chatHistory, newUserMessage], chatInput,
        });

        try {
            const resultText = await callGeminiAPI(prompt);
            setChatHistory((prev) => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { role: "ai", text: resultText };
                return newHistory;
            });
        } catch (err) {
            setChatHistory((prev) => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { role: "ai", text: `Sorry, I encountered an error: ${err.message}` };
                return newHistory;
            });
        } finally {
            setIsChatLoading(false);
        }
    };

    // Download states
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [downloadError, setDownloadError] = useState('');

    // Download handler
    const handleDownload = async () => {
        if (!code || !roomId) {
            toast.error('Missing code or room ID');
            return;
        }

        try {
            setDownloadLoading(true);
            setDownloadError('');

            // Add timeout to prevent infinite loading
            const downloadPromise = downloadCode(code, roomId);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Download timeout - server may be unresponsive')), 30000)
            );

            await Promise.race([downloadPromise, timeoutPromise]);
            toast.success('Download Started!')
        } catch (error) {
            toast.error(`Download failed: ${error.message || error}`);
            setDownloadError(error.message || 'Unknown error');
        } finally {
            setDownloadLoading(false);
        }
    };

    //Save code handler
    const handleSaveCode = async () => {
        setIsLoading(true);
        try {
            const response = await saveCode(roomId, code);
            if (response.success) {
                toast.success(response.message || 'Code saved successfully!');
            } else {
                toast.error(response.message || 'Failed to save code.');
            }
        } catch (error) {
            console.error('Save code error:', error);
            toast.error(error.response?.message || error.message || 'Failed to save code.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                handleSaveCode();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [roomId, code]);

    // Language change handler
    useEffect(() => {
        if (!roomId || !selectedLanguage) return;
        const handleLanguageChange = async () => {
            try {
                await changeLanguage(selectedLanguage.value, roomId);
            } catch (error) {
                toast.error(`Error changing language: ${error.message || error}`);
            }
        };
        handleLanguageChange();
    }, [selectedLanguage, roomId]);


    const toggleSidebar = () => {
        if (isMobile) {
            setSidebarOpen(!isSidebarOpen)
        } else {
            setSidebarCollapsed(!isSidebarCollapsed)
        }
    }



    return (
        <div className="relative h-screen bg-[#1e1e2e] text-[#cdd6f4] flex flex-col overflow-hidden">
            <div className="fixed inset-0 w-full h-full z-0">
                <BackgroundGradientAnimation />
            </div>

            <header className="h-16 bg-[#11111b] border-b border-[#313244] flex items-center justify-between px-6 z-10 flex-shrink-0">
                <div className="flex items-center gap-4">
                    {/* Mobile menu button */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleSidebar} 
                        className={`${isMobile ? 'flex' : 'hidden'} hover:bg-[#313244] text-[#cdd6f4] p-2 transition-all duration-300`}
                    >
                        <div className="relative w-5 h-5 flex items-center justify-center">
                            <Menu 
                                size={20} 
                                className={`absolute transition-all duration-300 ${
                                    isSidebarOpen 
                                        ? 'opacity-0 rotate-90 scale-75' 
                                        : 'opacity-100 rotate-0 scale-100'
                                }`}
                            />
                            {/* <X 
                                size={20} 
                                className={`absolute transition-all duration-300 ${
                                    isSidebarOpen 
                                        ? 'opacity-100 rotate-0 scale-100' 
                                        : 'opacity-0 rotate-90 scale-75'
                                }`}
                            /> */}
                        </div>
                    </Button>
                    
                    <div className="flex items-center space-x-3 z-10 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#a6e3a1] to-[#89b4fa]">
                            <Code2 className="h-6 w-6 text-[#1e1e2e]" />
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-[#a6e3a1]">{"<GoonShareAI/>"}</span>
                            <div className="text-xs text-[#7b7d87]">{"// v1.1.0-stable"}</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 z-10">
                    <Button
                        onClick={handleSaveCode}
                        variant="outline"
                        size="sm"
                        className="border-[#313244] hover:bg-[#313244] text-[#cdd6f4] bg-transparent"
                        title="Save (Ctrl+S)"
                    >
                        {isLoading ? <LoadingIcon className="w-5 h-5 mx-2" /> : <Save size={16} className="mr-2" />}
                        Save
                    </Button>
                </div>
            </header>


            <div className="flex-1 flex overflow-hidden">
                {/* Mobile overlay */}
                {isMobile && isSidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 animate-in fade-in-0" 
                        onClick={() => setSidebarOpen(false)} 
                    />
                )}

                <div
                    className={`
            ${isMobile ? "fixed left-0 top-16 bottom-0 z-50" : "relative"}
            ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
            ${!isMobile && isSidebarCollapsed ? "w-16" : "w-64"}
            bg-[#181825] border-r border-[#313244] flex flex-col transition-all duration-500 ease-in-out
            ${isMobile ? 'shadow-2xl' : ''}
          `}
                >
                    <div className="p-4 border-b border-[#313244] flex items-center justify-between">
                        <div className={`transition-all duration-500 overflow-hidden ${!isSidebarCollapsed ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'}`}>
                            <div className={`transition-all duration-300 ${!isSidebarCollapsed ? 'translate-x-0' : 'translate-x-4'}`}>
                                <h2 className="text-lg font-semibold text-[#f38ba8] mb-2">Languages</h2>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hover:bg-[#313244] text-[#cdd6f4] p-2 transition-all duration-300">
                            <div className="relative w-5 h-5 flex items-center justify-center">
                                <Menu 
                                    size={20} 
                                    className={`absolute transition-all duration-300 ${
                                        (isMobile && isSidebarOpen) || (!isMobile && !isSidebarCollapsed) 
                                            ? 'opacity-0 rotate-90 scale-75' 
                                            : 'opacity-100 rotate-0 scale-100'
                                    }`}
                                />
                                <X 
                                    size={20} 
                                    className={`absolute transition-all duration-300 ${
                                        (isMobile && isSidebarOpen) || (!isMobile && !isSidebarCollapsed) 
                                            ? 'opacity-100 rotate-0 scale-100' 
                                            : 'opacity-0 rotate-90 scale-75'
                                    }`}
                                />
                            </div>
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-2">
                        <div className="space-y-1">
                            {languages.map((language) => {
                                const IconComponent = language.icon
                                return (
                                    <button
                                        key={language.id}
                                        onClick={() => {
                                            setSelectedLanguage(language)
                                            if (isMobile) setSidebarOpen(false)
                                        }}
                                        className={`w-full flex items-center rounded-lg transition-all duration-300 hover:bg-[#313244] hover:scale-[1.02] active:scale-[0.98] ${selectedLanguage.id === language.id ? "bg-[#313244] border border-[#f38ba8] shadow-lg shadow-[#f38ba8]/20" : ""
                                            } ${isSidebarCollapsed ? "justify-center p-2" : "gap-3 p-3"}`}
                                        title={isSidebarCollapsed ? language.name : ""}
                                    >
                                        <div className={`p-2 rounded-md ${language.color} flex-shrink-0 transition-all duration-300`}>
                                            <IconComponent size={16} />
                                        </div>
                                        {!isSidebarCollapsed && (
                                            <span className="font-medium transition-all duration-300 opacity-100 translate-x-0">
                                                {language.name}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Column 2: Editor */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    <div className="h-14 bg-[#181825] border-b border-[#313244] flex items-center justify-between px-4 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md ${selectedLanguage.color}`}>
                                <selectedLanguage.icon size={20} />
                            </div>
                            <h1 className="text-xl font-semibold">{selectedLanguage.name} Editor</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={handleCopyCode} variant="outline" size="sm" className=" hover:bg-[#313244] text-[#cdd6f4] bg-transparent"
                                disabled={!code}>

                                {isCopied ? <Check size={16} className="mr-2" /> : <Copy size={16} />}
                                {isCopied ? "Copied!" : ''}
                            </Button>

                            <Button
                                onClick={handleDownload} variant="outline" size="sm"
                                disabled={downloadLoading || !code}
                                className={`hover:bg-[#313244] text-[#cdd6f4] bg-transparent transition-colors duration-200 disabled:opacity-50 flex items-center gap-2 ${downloadError ? "bg-red-900/50" : ""}`}
                                title={downloadError || 'Download code'}
                            >
                                {downloadLoading ? <LoadingIcon className="w-5 h-5" /> : <DownloadIcon className="w-5 h-5" />}
                                {downloadError ? <span className="text-xs text-red-400 ml-2">{downloadError}</span> : null}
                            </Button>

                            <Button onClick={handleReview} className="bg-[#f38ba8] hover:bg-[#f38ba8]/80 text-[#1e1e2e] font-semibold" disabled={isLoading}>
                                <EnhanceIcon size={16} className="mr-2" />
                                Goon
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setChatOpen((v) => !v)} className="border-[#313244] hover:bg-[#313244]">
                                <MessageCircle size={16} />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 p-4 h-full">
                        <CodeEditor
                            code={code}
                            setCode={setCode}
                            language={selectedLanguage.id}
                            roomId={roomId}
                            onLanguageChange={(val) => {
                                const found = languages.find((l) => l.id === val) || selectedLanguage;
                                setSelectedLanguage(found);
                            }}
                        />
                    </div>
                </div>


                {isChatOpen && (
                    <div className="flex flex-shrink-0">
                        <div onMouseDown={handleMouseDown} className="w-1 bg-[#313244] cursor-col-resize hover:bg-[#f38ba8] z-10 transition-colors" />
                        <div className=" border-l border-[#313244] flex flex-col z-10" style={{ width: panelWidth }}>
                            <div className="h-14 bg-[#181825] border-b border-[#313244] flex items-center justify-between px-4 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-[#a6e3a1] rounded-full animate-pulse" />
                                    <h3 className="font-semibold text-[#a6e3a1]">Goonology AI</h3>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="hover:bg-[#313244]">
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
                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`py-3 px-4 ${msg.role === "user" ? "bg-transparent" : "bg-transparent"}`}>
                                            <div className={`${msg.role === "user" ? "ml-auto max-w-[75%] bg-[#242431] text-[#ffffff] px-4 py-3 rounded-3xl" : "max-w-[85%] bg-[#1e1e2e] text-[#ffffff] px-4 py-3 rounded-3xl"}`}>
                                                <p
                                                    className={`text-xs opacity-90 mb-2 font-medium ${msg.role === "user" ? "text-gray-400" : "text-[#a6e3a1]"
                                                        }`}
                                                >
                                                    {msg.role === "user" ? "You" : "GoonologyAI"}
                                                </p>

                                                {msg.text ? (
                                                    <MarkdownRenderer text={msg.text} onUseCode={(newCode) => setCode(newCode)} />
                                                ) : (
                                                    <div className="text-[#a1a1a1] animate-pulse flex items-center gap-2">
                                                        <div className="flex space-x-1">
                                                            <div className="w-2 h-2 bg-[#a1a1a1] rounded-full animate-bounce"></div>
                                                            <div className="w-2 h-2 bg-[#a1a1a1] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                            <div className="w-2 h-2 bg-[#a1a1a1] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                        </div>
                                                        <span>Thinking...</span>
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
                                        disabled={isChatLoading || isLoading}
                                    />
                                    <Button type="submit" size="icon" disabled={isChatLoading || isLoading || !chatInput.trim()} className="bg-[#f0f6ef] hover:bg-[#a6e3a1]/80 text-[#1e1e2e]">
                                        <ArrowUp size={16} />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}