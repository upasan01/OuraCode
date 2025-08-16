import React, { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { webSocketApi, MESSAGE_TYPES } from "../../server/api/webSocketApi";

// UI Components (the pretty stuff that makes users happy) ✨
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/ScrollArea";
import { LoadingIcon, EnhanceIcon } from "../components/ui/Icons";
import BackgroundGradientAnimation from "../components/ui/BackgroundGradientAnimation";
import { SiJavascript, SiPython, SiCplusplus, SiC, SiTypescript, SiKotlin } from 'react-icons/si';
import { FaJava, FaRust, FaPhp, FaSwift } from "react-icons/fa"
import { TbBrandCSharp } from "react-icons/tb"
import { FaGolang } from "react-icons/fa6"
import { DiRuby } from "react-icons/di";

// App Components (our homemade goodies) 🏠
import CodeEditor from "../components/layout/CodeEditor";
import AiPanel from "../components/layout/AiPanel";
import { toast } from "react-hot-toast";
import { Terminal } from "../components/layout/Terminal";

// Icons (because we love visual candy) 🍭
import {
    MessageCircle, Code2, Copy, X, Check, DownloadIcon, Save, Menu, Terminal as TerminalIcon
} from "lucide-react";

// API (the backend communication squad) 📡
import { downloadCode, saveCode, changeLanguage } from '../../server/api/controllerApi';

export default function App() {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId");
    const location = useLocation();
    const {
        language: initialLanguage,
        username: passedUsername,
    } = location.state || {};

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
    // copy code handler (ctrl+c but with extra steps) 📋
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy code:", err);
        }
    };
    // state management central command 🎮
    const [isLoading, setIsLoading] = useState(false);

    // sidebar states (for that mobile responsive flex) 📱
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [isSidebarOpen, setSidebarOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const terminalRef = useRef(null);

    // AI Panel State (where the magic happens) ✨
    const [isChatOpen, setChatOpen] = useState(false);
    const aiPanelRef = useRef(null);


    // mobile responsiveness handler (gotta look good on all screens) 📱💻
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

    // download state management (for when things go wrong) 💀
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [downloadError, setDownloadError] = useState('');

    // review handler that doesn't care about panel drama 🎭
    const handleReview = async () => {
        if (!code.trim()) {
            toast.error("Please enter some code to review.");
            return;
        }
        
        // always make sure panel is vibing open
        setChatOpen(true);
        
        // wait a hot sec for panel to open, then hit that review button
        setTimeout(() => {
            if (aiPanelRef.current) {
                aiPanelRef.current.triggerReview();
            }
        }, isChatOpen ? 0 : 100); // no delay if already open, tiny delay if opening
    };

    // download handler (when you need that code offline) 💾
    const handleDownload = async () => {
        if (!code || !roomId) {
            toast.error('Missing code or room ID');
            return;
        }

        try {
            setDownloadLoading(true);
            setDownloadError('');

            // timeout protection bc we ain't waiting forever
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

    // save code handler (ctrl+s but make it fancy) 💾✨
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

    // ctrl+s keyboard listener (because we're fancy like that) ⌨️
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

    // language change handler (when you switch your coding vibe) 🔄
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

    // websocket connection state (real-time collab vibes) 🌐
    const [wsConnected, setWsConnected] = useState(false);
    const [currentUsername, setCurrentUsername] = useState('');
    const wsInitialized = useRef(false);
    const codeChangeTimeoutRef = useRef(null);


    const username = useMemo(() => {
        if (passedUsername) return passedUsername;
        // store username in sessionStorage so it persists across refreshes (smart move)
        const stored = sessionStorage.getItem('temp_username');
        if (stored) return stored;

        const generated = `User_${Math.random().toString(36).substr(2, 8)}`;
        sessionStorage.setItem('temp_username', generated);
        return generated;
    }, [passedUsername]);


    // websocket connection and event handling (the networking magic) 🎯
    useEffect(() => {
        if (!roomId || wsInitialized.current) return;

        const initializeWebSocket = async () => {
            try {
                console.log('Initializing WebSocket connection...');
                
                // clear existing handlers to prevent chaos and duplicates
                webSocketApi.clearHandlers();

                // set up event handlers BEFORE connecting (order matters bestie)
                webSocketApi.onConnect(() => {
                    console.log('WebSocket connected, updating state...');
                    setWsConnected(true);
                    setCurrentUsername(username);
                    toast.success('Connected to collaboration server');
                });

                webSocketApi.onDisconnect(() => {
                    console.log('WebSocket disconnected, updating state...');
                    setWsConnected(false);
                    toast.error('Disconnected from collaboration server');
                });

                webSocketApi.onError((error) => {
                    console.error('WebSocket error:', error);
                    toast.error('Connection error occurred');
                    setWsConnected(false);
                });

                // message handlers (the real-time communication squad)
                webSocketApi.onMessage(MESSAGE_TYPES.LOAD_CODE, (data) => {
                    console.log('Loading existing code:', data.code);
                    setCode(data.code || '');
                });

                webSocketApi.onMessage(MESSAGE_TYPES.USER_JOINED, (data) => {
                    console.log('User joined:', data);
                    toast.success(data.message);
                });

                webSocketApi.onMessage(MESSAGE_TYPES.ERROR, (data) => {
                    console.error('WebSocket error message:', data);
                    toast.error(data.message || 'An error occurred');
                });

                webSocketApi.onMessage(MESSAGE_TYPES.CODE_UPDATE, (data) => {
                    console.log('Received code update from:', data.username, data.code);
                    setCode(data.code || '');
                    toast.success(`Code updated by ${data.username}`);
                });

                // use the enhanced initialize method for better connection management
                const connected = await webSocketApi.initialize('ws://localhost:3000', roomId, username);
                
                if (connected) {
                    console.log('WebSocket initialized successfully');
                    setWsConnected(true);
                    setCurrentUsername(username);
                } else {
                    console.error('Failed to initialize WebSocket');
                    setWsConnected(false);
                    toast.error('Failed to connect to collaboration server');
                }

                wsInitialized.current = true;

            } catch (error) {
                console.error('Failed to initialize WebSocket:', error);
                toast.error('Failed to connect to collaboration server');
                setWsConnected(false);
            }
        };

        initializeWebSocket();

        // cleanup on unmount (good housekeeping vibes) 🧹
        return () => {
            if (wsInitialized.current) {
                console.log('Cleaning up WebSocket connection');
                webSocketApi.disconnect();
                wsInitialized.current = false;
                setWsConnected(false);
            }
        };
    }, [roomId]);

    // debounced code change handler for real-time sync (prevents server spam - we're considerate like that) 📡
    const debouncedSendCodeChange = useCallback((newCode) => {
        if (codeChangeTimeoutRef.current) {
            clearTimeout(codeChangeTimeoutRef.current);
        }

        codeChangeTimeoutRef.current = setTimeout(() => {
            if (wsConnected && roomId) {
                console.log('Broadcasting code change to room:', roomId);
                webSocketApi.sendCodeChange(roomId, newCode);
            }
        }, 500); // 500ms debounce to avoid server flooding
    }, [wsConnected, roomId]);

    // enhanced code change handler (the main character of real-time collab) ✨
    const handleCodeChange = useCallback((newCode) => {
        setCode(newCode);
        debouncedSendCodeChange(newCode);
    }, [debouncedSendCodeChange]);



    return (
        <div className="relative h-screen bg-[#1e1e2e] text-[#cdd6f4] flex flex-col overflow-hidden ">
            <div className="fixed inset-0 w-full h-full z-0">
                <BackgroundGradientAnimation />
            </div>

            <header className="h-16 bg-[#11111b] border-b border-[#313244] flex items-center justify-between px-6 z-10 flex-shrink-0">
                <div className="flex items-center gap-4">
                    {/* mobile menu button (hamburger menu but make it aesthetic) 🍔 */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className={`${isMobile ? 'flex' : 'hidden'} hover:bg-[#313244] text-[#cdd6f4] p-2 transition-all duration-300`}
                    >
                        <div className="relative w-5 h-5 flex items-center justify-center">
                            <Menu
                                size={20}
                                className={`absolute transition-all duration-300 ${isSidebarOpen
                                    ? 'opacity-0 rotate-90 scale-75'
                                    : 'opacity-100 rotate-0 scale-100'
                                    }`}
                            />
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
                    {/* connection status indicator (so you know if you're vibing with the server) 📡 */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800/50 border border-slate-600/50">
                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                            }`} />
                        <span className="text-xs text-slate-300">
                            {wsConnected
                                ? `${username} • Connected`
                                : `${username} • Disconnected`
                            }
                        </span>
                    </div>
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

           {/* Column 1: Sidebar (the language picker zone) 🗂️ */}
            <div className="flex-1 flex overflow-hidden">
                {/* mobile overlay (so the sidebar doesn't just float there awkwardly) */}
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
                                    className={`absolute transition-all duration-300 ${(isMobile && isSidebarOpen) || (!isMobile && !isSidebarCollapsed)
                                        ? 'opacity-0 rotate-90 scale-75'
                                        : 'opacity-100 rotate-0 scale-100'
                                        }`}
                                />
                                <X
                                    size={20}
                                    className={`absolute transition-all duration-300 ${(isMobile && isSidebarOpen) || (!isMobile && !isSidebarCollapsed)
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

                {/* column 2: editor (where the coding magic happens) ⌨️ */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    <div className="h-14 bg-[#181825] border-b border-[#313244] flex items-center justify-between px-4 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md ${selectedLanguage.color}`}>
                                <selectedLanguage.icon size={20} />
                            </div>
                            <h1 className="text-xl font-semibold">{selectedLanguage.name} Editor</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={() => terminalRef.current?.toggle?.()}
                                variant="outline"
                                size="icon"
                                className={`border-[#313244] hover:bg-[#313244] ${""}`}
                            >
                                <TerminalIcon size={16} />
                            </Button>
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
                    {/* code editor area (the main event) 🎯 */}
                    <div className="flex-1 p-4 h-full editor-area">
                        <CodeEditor
                            code={code}
                            setCode={handleCodeChange}
                            language={selectedLanguage.id}
                            roomId={roomId}
                            wsConnected={wsConnected}   // Pass connection status
                        />
                        <Terminal
                            ref={terminalRef}
                            initialHeight={220}
                            minHeight={120}
                            maxHeightPx={800}
                            editorSelector=".editor-area"
                            className="editor-terminal"
                        />

                    </div>
                </div>

                {/*column 3: AI panel (where the goons live) 🤖 */}
                <AiPanel
                    ref={aiPanelRef}
                    isOpen={isChatOpen}
                    onClose={() => setChatOpen(false)}
                    code={code}
                    selectedLanguage={selectedLanguage}
                    setCode={setCode}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}