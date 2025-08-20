import React, { useEffect, useMemo, useCallback, useRef, useState, use } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { webSocketApi } from "../../server/api/webSocketApi";

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
    MessageCircle, Code2, Copy, X, Check, DownloadIcon, Save, Menu, Terminal as TerminalIcon, Play
} from "lucide-react";

// API (the backend communication squad) 📡
import { downloadCode, saveCode, runCode } from '../../server/api/controllerApi';

export default function App() {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId");
    const location = useLocation();
    const {
        language: initialLanguage,
        username: passedUsername,
    } = location.state || {};

    sessionStorage.setItem("storedusername", passedUsername);

    // In Room.jsx

    // A nice, vibrant color palette for cursors
    const CURSOR_COLORS = [
        '#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF3300',
        '#3300FF', '#FF6600', '#66FF00', '#FF0066', '#0066FF',
        '#CCFF00', '#FF00CC', '#00CCFF', '#FF9900', '#9900FF'
    ];
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

    // Code based states
    const defaultLang = languages.find((l) => l.value === initialLanguage) || languages[0];
    const [selectedLanguage, setSelectedLanguage] = useState(defaultLang);
    const [code, setCode] = useState("");
    const codeEditorRef = useRef(null);
    const [remoteCursors, setRemoteCursors] = useState(() => new Map());
    const userColors = useRef(new Map());

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
    const [isRunning, setIsRunning] = useState(false);

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

    // review handler that doesn't care about panel drama 
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

    // download handler (when you need that code offline) 
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

    // handle running code
    const handleRunCode = async () => {
        if (!code.trim()) {
            toast.error("Please enter some code to run.");
            return;
        }

        try {
            setIsRunning(true);
            terminalRef.current?.open?.();
            terminalRef.current?.addOutput?.(`Running code in ${selectedLanguage.name}...`, "info");
            const result = await runCode(code, roomId);
            if (result.success) {
                if (result.output) {
                    terminalRef.current?.addOutput?.(result.output, "output");
                }
                if (result.error) {
                    terminalRef.current?.addOutput?.(result.error, "error");
                }
                if (!result.output && !result.error) {
                    terminalRef.current?.addOutput?.("No output or error returned from the server.", "info");
                }
            }
        } catch (error) {
            console.error('Run code error:', error);
            terminalRef.current?.addOutput?.(`Error running code: ${error.message || error}`, "error");
            toast.error(error.response?.message || error.message || 'Failed to run code.');
        } finally {
            setIsRunning(false);
        }
    };

    // ctrl+s keyboard listener (because we're fancy like that) 
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                handleSaveCode();
            }
            if (event.ctrlKey && event.key === 'g') {
                event.preventDefault();
                handleRunCode();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [roomId, code]);



    const toggleSidebar = () => {
        if (isMobile) {
            setSidebarOpen(!isSidebarOpen)
        } else {
            setSidebarCollapsed(!isSidebarCollapsed)
        }
    }

    // websocket connection state (real-time collab vibes) 
    const [wsConnected, setWsConnected] = useState(false);
    const [username] = useState(passedUsername || sessionStorage.getItem("storedusername"));

    useEffect(() => {
        if (!roomId || !username) return;
        webSocketApi.connect(roomId, username, {
            onConnect: () => {
                setWsConnected(true);
                toast.success(`Welcome to the room, ${username}!`);
            },
            onDisconnect: () => {
                setWsConnected(false);
                toast.error(`We'll miss you, ${username}!`);
            },
            onLoadCode: (loadedCode) => {
                setCode(loadedCode);
                // set timeout ensures monaco mounted before rendering the code
                setTimeout(() => {
                    codeEditorRef.current?.applyRemoteUpdate(loadedCode);
                }, 50);
            },

            onCodeUpdate: (newcode, fromUsername) => {
                if (fromUsername !== username) {
                    codeEditorRef.current?.applyRemoteUpdate(newcode);
                }
            },


            onCursorUpdate: (fromUsername, cursorPosition) => {
                if (fromUsername !== username) {
                    console.log(`Cursor update from ${fromUsername}:`, cursorPosition);
                    // Check if we have a color for this user. If not, assign one.
                    if (!userColors.current.has(fromUsername)) {
                        const colorIndex = userColors.current.size % CURSOR_COLORS.length;
                        userColors.current.set(fromUsername, CURSOR_COLORS[colorIndex]);
                    }

                    const userColor = userColors.current.get(fromUsername);

                    setRemoteCursors(prev => {
                        const next = new Map(prev);
                        // Store the position AND the color
                        next.set(fromUsername, {
                            position: cursorPosition,
                            color: userColor
                        });
                        return next;
                    });
                }
            },

            onUserJoined: (message) => {
                if (message.username !== username) {
                    toast(message.message);
                }
            },
            onUserLeft: (message) => {
                if (message.username !== username) {
                    console.log(`User left: ${message.username}`);
                    
                    // Remove the user's cursor from remote cursors
                    setRemoteCursors(prev => {
                        const next = new Map(prev);
                        next.delete(message.username);
                        console.log(`Removed cursor for ${message.username}`);
                        return next;
                    });

                    // Remove the user's color assignment to free it up for reuse
                    userColors.current.delete(message.username);
                    
                    toast(`${message.username} has left the room `);
                }
            },
            onLanguageChanged: (newLanguage, fromUsername) => {
                if (fromUsername !== username) {
                    const langObj = languages.find(l => l.id === newLanguage || l.value === newLanguage);
                    if (langObj) {
                        setSelectedLanguage(langObj);
                        toast(`${fromUsername} changed language to ${langObj.name} 🔄`);
                    }
                }
            },
            onError: (error) => {
                toast.error(error.message)
            }
        });
        return () => {
            webSocketApi.disconnect(code); // sending the code on disconnect
        };
    }, [roomId, username]);

    // language change handler (when you switch your coding vibe) 
    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
        if (wsConnected) {
            webSocketApi.sendLanguageChange(roomId, language.value);
        }
        if (isMobile) {
            setSidebarOpen(false);
        }
    };
    const cursorTimeoutRef = useRef(null);

    // handle cursor change (when the user moves their cursor)
    const handleCursorChange = useCallback((position) => {
        if (webSocketApi.isConnected()) {
            // // To be thought if actually needed
            // if (cursorTimeoutRef.current) {
            //     clearTimeout(cursorTimeoutRef.current);
            // }
            cursorTimeoutRef.current = setTimeout(() => {
                webSocketApi.sendCursorSync(roomId, position);
            }, 100); // 100ms delay too prevent race condition with change code
        }
    }, [roomId]);

    // Add cleanup (somewhere after your existing useEffects)
    useEffect(() => {
        return () => {
            if (cursorTimeoutRef.current) {
                clearTimeout(cursorTimeoutRef.current);
            }
        };
    }, []);

    //debounce code updates to avoid spamming the server
    useEffect(() => {
        if (!wsConnected || !code) return;

        const timeoutId = setTimeout(() => {
            webSocketApi.sendCodeChange(roomId, code);
        }, 50);
        return () => clearTimeout(timeoutId);
    }, [code, wsConnected, roomId]);



    return (
        <div className="relative h-screen bg-[#1e1e2e] text-[#cdd6f4] flex flex-col overflow-hidden ">
            <div className="fixed inset-0 w-full h-full z-0">
                <BackgroundGradientAnimation />
            </div>

            <header className="h-16 bg-[#11111b] border-b border-[#313244] flex items-center justify-between px-6 z-10 flex-shrink-0">
                <div className="flex items-center gap-4">
                    {/* mobile menu button (hamburger menu but make it aesthetic)  */}
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
                    {/* connection status indicator (so you know if you're vibing with the server)  */}
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

                    <Button
                        onClick={handleDownload} variant="outline" size="sm"
                        disabled={downloadLoading || !code}
                        className={`hover:bg-[#313244] text-[#cdd6f4] bg-transparent transition-colors duration-200 disabled:opacity-50 flex items-center gap-2 ${downloadError ? "bg-red-900/50" : ""}`}
                        title={downloadError || 'Download code'}
                    >
                        {downloadLoading ? <LoadingIcon className="w-5 h-5" /> : <DownloadIcon className="w-5 h-5" />}
                        {downloadError ? <span className="text-xs text-red-400 ml-2">{downloadError}</span> : null}
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
                                        onClick={() => handleLanguageChange(language)}
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
                                onClick={handleRunCode}
                                variant="outline"
                                size="sm"
                                disabled={isRunning || !code.trim()}
                                className="bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#1e1e2e] hover:text-[#6363f6] font-semibold disabled:opacity-50"
                            >
                                {isRunning ? (
                                    <>
                                        <LoadingIcon size={16} className="mr-2" />
                                        Running...
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} className="mr-2" />
                                        Run
                                    </>
                                )}
                            </Button>
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
                            ref={codeEditorRef}
                            code={code}
                            setCode={setCode}
                            language={selectedLanguage.id}
                            onCursorChange={handleCursorChange}
                            remoteCursors={remoteCursors}
                            myUserName={username}
                        />

                        {/* Terminal Section */}
                        <Terminal
                            ref={terminalRef}
                            initialHeight={220}
                            minHeight={120}
                            maxHeightPx={800}
                            editorSelector=".editor-area"
                            className="editor-terminal"
                            isCodeRunning={isRunning}
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