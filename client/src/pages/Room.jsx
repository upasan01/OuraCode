import React, { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { webSocketApi } from "../../server/api/webSocketApi";

// UI Components
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/ScrollArea";
import { Badge } from "../components/ui/badge"; // 
import { LoadingIcon, EnhanceIcon } from "../components/ui/Icons";
import BackgroundGradientAnimation from "../components/ui/BackgroundGradientAnimation";
import { SiJavascript, SiPython, SiCplusplus, SiC } from 'react-icons/si';
import { FaJava } from "react-icons/fa";
import { TbBrandCSharp } from "react-icons/tb";
import { FaGolang } from "react-icons/fa6";

// App Components
import CodeEditor from "../components/layout/CodeEditor";
import AiPanel from "../components/layout/AiPanel";
import { toast } from "react-hot-toast";
import { Terminal } from "../components/layout/Terminal";

// Icons
import {
    MessageCircle,
    Code2,
    Copy,
    Check,
    Download as DownloadIcon,
    Save,
    Menu,
    Terminal as TerminalIcon,
    Play,
    Users,
    Languages,
    X,
} from "lucide-react";

// API
import { downloadCode, saveCode } from '../../server/api/controllerApi';

export default function App() {
    const [searchParams] = useSearchParams();
    const roomId = searchParams.get("roomId");
    const location = useLocation();
    const {
        language: initialLanguage,
        username: passedUsername,
    } = location.state || {};

    //  only persist if we actually have a username
    useEffect(() => {
        if (passedUsername) {
            sessionStorage.setItem("storedusername", passedUsername);
        }
    }, [passedUsername]);

    // A nice, vibrant color palette for cursors
    const CURSOR_COLORS = [
        '#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF3300',
        '#3300FF', '#FF6600', '#66FF00', '#FF0066', '#0066FF',
        '#CCFF00', '#FF00CC', '#00CCFF', '#FF9900', '#9900FF'
    ];

    //  languages -> memoized
    const languages = useMemo(
        () => [
            { id: "c", value: "c", name: "C", icon: SiC, color: "bg-gray-500/20 text-gray-300" },
            { id: "cpp", value: "cpp", name: "C++", icon: SiCplusplus, color: "bg-purple-500/20 text-purple-300" },
            { id: "python", value: "py", name: "Python", icon: SiPython, color: "bg-green-500/20 text-green-300" },
            { id: "java", value: "java", name: "Java", icon: FaJava, color: "bg-orange-500/20 text-orange-300" },
            { id: "javascript", value: "js", name: "JavaScript", icon: SiJavascript, color: "bg-yellow-500/20 text-yellow-300" },
            { id: "csharp", value: "cs", name: "C#", icon: TbBrandCSharp, color: "bg-teal-500/20 text-teal-300" },
            { id: "go", value: "go", name: "Go lang", icon: FaGolang, color: "bg-[#00ADD8]/20 text-[#00ADD8]" },
        ],
        []
    );

    // ✅ pick default language defensively (supports id/value/name)
    const computedDefaultLang = useMemo(() => {
        const key = String(initialLanguage || '').toLowerCase();
        return (
            languages.find(l => l.value === key || l.id === key || l.name.toLowerCase() === key) ||
            languages[0]
        );
    }, [languages, initialLanguage]);

    // Code-based state
    const [selectedLanguage, setSelectedLanguage] = useState(computedDefaultLang);
    useEffect(() => setSelectedLanguage(computedDefaultLang), [computedDefaultLang]);

    const [code, setCode] = useState("");
    const codeEditorRef = useRef(null);
    const [remoteCursors, setRemoteCursors] = useState(() => new Map());
    const userColors = useRef(new Map());

    const [isCopied, setIsCopied] = useState(false);
    const [isCopyId, setIsCopyId] = useState(false);
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error(err);
            toast.error("Failed to copy code.");
        }
    };
    const handleCopyId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            setIsCopyId(true);
            setTimeout(() => setIsCopyId(false), 1000);
        } catch (err) {
            console.error(err);
            toast.error("Failed to copy room ID.");
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    // Sidebar / layout
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarView, setSidebarView] = useState("languages");
    const terminalRef = useRef(null);

    // AI Panel
    const [isChatOpen, setChatOpen] = useState(false);
    const aiPanelRef = useRef(null);
    const handleUseAiCode = (newCode) => {
        setCode(newCode);
    };

    // mobile responsiveness
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarCollapsed(false);
                setSidebarOpen(false);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Download state
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [downloadError, setDownloadError] = useState('');

    const handleReview = async () => {
        if (!code.trim()) {
            toast.error("Please enter some code to review.");
            return;
        }
        setChatOpen(true);
        setTimeout(() => {
            aiPanelRef.current?.triggerReview?.();
        }, isChatOpen ? 0 : 100);
    };

    const handleDownload = async () => {
        if (!code || !roomId) {
            toast.error('Missing code or room ID');
            return;
        }
        try {
            setDownloadLoading(true);
            setDownloadError('');
            const downloadPromise = downloadCode(code, roomId);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Download timeout - server may be unresponsive')), 30000)
            );
            await Promise.race([downloadPromise, timeoutPromise]);
            toast.success('Download Started!');
        } catch (error) {
            console.error(error);
            toast.error(`Download failed: ${error.message || error}`);
            setDownloadError(error.message || 'Unknown error');
        } finally {
            setDownloadLoading(false);
        }
    };

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


    // ctrl+s / ctrl+g
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
        if (isMobile) setSidebarOpen(!isSidebarOpen);
        else setSidebarCollapsed(!isSidebarCollapsed);
    };

    // WebSocket state
    const [wsConnected, setWsConnected] = useState(false);
    const [username] = useState(passedUsername || sessionStorage.getItem("storedusername") || "Guest");
    const [usersMap, setUsersMap] = useState(() => new Map());

    const createDynamicMembers = (currentUser, userMap) => {
        const initials = String(currentUser || 'U').split(" ").map((w) => w[0]).join("").toUpperCase();

        const currentUserObj = {
            id: "current", name: currentUser || 'You', avatar: initials,
            status: "online", role: "Owner", color: "bg-red-500", isCurrent: true,
        };

        const colors = [
            "bg-[#00FFFF]",
            "bg-[#FF00FF]",
            "bg-[#39FF14]",
            "bg-[#FFFB00]",
            "bg-[#FF3131]",
            "bg-[#00F0FF]",
            "bg-[#F38BA8]",
            "bg-[#A6E3A1]",
            "bg-[#89B4FA]",
        ];

        // Convert the Map to an array of [username, userData] pairs to process it
        const otherMembers = [...userMap.entries()]
            .filter(([username]) => username !== currentUser)
            .map(([username, userData], index) => {
                const display = username;
                const avatar = display.split(" ").map((w) => w[0]).join("").toUpperCase();

                return {
                    id: `user-${index}`,
                    name: display,
                    avatar,
                    status: userData.status,
                    role: "Editor",
                    color: colors[index % colors.length],
                    isCurrent: false,
                };
            });

        return [currentUserObj, ...otherMembers];
    };

    // compute members & onlineMembers without the undefined var bug
    const members = useMemo(() => createDynamicMembers(username, usersMap), [username, usersMap]);
    const onlineMembers = useMemo(() => members.filter((m) => m.status === 'online'), [members]);
    const isRemoteUpdate = useRef(false);

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
                setTimeout(() => {
                    codeEditorRef.current?.applyRemoteUpdate?.(loadedCode);
                }, 50);
            },
            onCodeUpdate: (newcode, fromUsername) => {
                if (fromUsername !== username) {
                    codeEditorRef.current?.applyRemoteUpdate?.(newcode);
                    isRemoteUpdate.current = true;
                    setCode(newcode);
                }
            },
            onCursorUpdate: (fromUsername, cursorPosition) => {
                if (fromUsername !== username) {
                    if (!userColors.current.has(fromUsername)) {
                        const colorIndex = userColors.current.size % CURSOR_COLORS.length;
                        userColors.current.set(fromUsername, CURSOR_COLORS[colorIndex]);
                    }
                    const userColor = userColors.current.get(fromUsername);
                    setRemoteCursors(prev => {
                        const next = new Map(prev);
                        next.set(fromUsername, { position: cursorPosition, color: userColor });
                        return next;
                    });
                }
            },
            onUserJoined: (message) => {
                if (message?.username !== username && message?.message) {
                    toast(message.message);
                    setUsersMap(prev => new Map(prev).set(message.username, { status: 'online' }));
                }
            },
            onUserLeft: (message) => {
                if (message?.username !== username) {
                    setUsersMap(prev => {
                        const next = new Map(prev);
                        if (next.has(message.username)) {
                            next.set(message.username, { status: 'offline' });
                        }
                        return next;
                    });
                    setRemoteCursors(prev => {
                        const next = new Map(prev);
                        next.delete(message.username);
                        return next;
                    });
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
            onAllUsersSent: (users) => {
                setUsersMap(prev => {
                    const next = new Map(prev);
                    users.forEach(user => {
                        if (!next.has(user)) {
                            next.set(user, { status: 'online' });
                        }
                    });
                    console.log("All users in the room:", users);
                    return next;
                });
            },
            onStdout: (data) => {
                terminalRef.current?.addOutput?.(data, "output");
            },
            onStderr: (data) => {
                terminalRef.current?.addOutput?.(data, "error");
            },
            onRunDone: (exitCode) => {
                terminalRef.current?.addOutput?.(`Process finished with exit code ${exitCode}.`, "info");
                setIsRunning(false);
            },
            onError: (error) => {
                toast.error(error.message);
                setIsRunning(false);
            }
        });
        return () => {
            webSocketApi.disconnect();
        };
    }, [roomId, username, languages]);

    const handleTerminalInput = (data) => {
        webSocketApi.sendInputToProcess(data);
    };

    const handleRunCode = () => {
        if (!code.trim()) {
            toast.error("Please enter some code to run.");
            return;
        }
        setIsRunning(true);
        terminalRef.current?.open?.();
        terminalRef.current?.addOutput?.(`Running code in ${selectedLanguage.name}...`, "info");
        webSocketApi.runCode(roomId, selectedLanguage.value, code);
    };

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
        if (wsConnected) {
            webSocketApi.sendLanguageChange(roomId, language.value);
        }
        if (isMobile) setSidebarOpen(false);
    };

    const cursorTimeoutRef = useRef(null);

    const handleCursorChange = useCallback((position) => {
        if (webSocketApi.isConnected()) {
            if (cursorTimeoutRef.current) clearTimeout(cursorTimeoutRef.current);
            cursorTimeoutRef.current = setTimeout(() => {
                webSocketApi.sendCursorSync(roomId, position);
            }, 100);
        }
    }, [roomId]);

    useEffect(() => () => cursorTimeoutRef.current && clearTimeout(cursorTimeoutRef.current), []);

    useEffect(() => {
        if (!wsConnected) return;
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }
        const timeoutId = setTimeout(() => {
            webSocketApi.sendCodeChange(roomId, code);
        }, 50);
        return () => clearTimeout(timeoutId);
    }, [code, wsConnected, roomId]);

    const SelectedIcon = selectedLanguage?.icon || Code2;

    return (
        <div className="relative h-screen bg-[#1e1e2e] text-[#cdd6f4] flex flex-col overflow-hidden">
            <div className="fixed inset-0 w-full h-full z-0">
                <BackgroundGradientAnimation />
            </div>

            <header className="h-12 sm:h-16 bg-[#11111b] border-b border-[#313244] flex items-center justify-between px-2 sm:px-6 z-10 flex-shrink-0">
                <div className="flex items-center gap-1 sm:gap-4">
                    {/* mobile menu */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className={`${isMobile ? 'flex' : 'hidden'} hover:bg-[#313244] text-[#cdd6f4] h-8 w-8 sm:h-10 sm:w-10 transition-all duration-300`}
                    >
                        <Menu size={18} className="sm:w-5 sm:h-5" />
                    </Button>

                    <div className="flex items-center space-x-1 sm:space-x-3 z-10 mb-2">
                        <div className="flex h-6 w-6 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#a6e3a1] to-[#89b4fa]">
                            <Code2 className="h-3 w-3 sm:h-6 sm:w-6 text-[#1e1e2e]" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-lg sm:text-2xl font-bold text-[#a6e3a1]">{"<OuRAcoDE/>"}</span>
                            <div className="text-xs text-[#7b7d87]">{"// v1.1.0-stable"}</div>
                        </div>
                        <div className="block sm:hidden">
                            <span className="text-sm font-bold text-[#a6e3a1]">{"<OuRAcoDE/>"}</span>
                        </div>
                    </div>
                </div>
                
                {/* Room ID */}
                <Button
                    onClick={handleCopyId}
                    className="h-8 sm:h-10 px-2 sm:px-4 bg-[#1e1e2e] rounded-lg border border-[#a6e3a1]/30 hover:bg-[#313244] min-w-0 text-xs sm:text-base">
                    {isCopyId ? <Check size={14} className="sm:w-[18px] sm:h-[18px] mr-1 sm:mr-2 text-[#a6e3a1]" /> : <Copy size={14} className="sm:w-[18px] sm:h-[18px] text-[#a6e3a1]" />}
                    <span className="font-bold text-[#a6e3a1] tracking-wider font-mono truncate max-w-[80px] sm:max-w-none text-xs">
                        roomId
                    </span>
                </Button>
                
                <div className="flex items-center gap-1 sm:gap-2 z-10">
                    {/* connection status */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800/50 border border-slate-600/50">
                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                        <span className="text-xs text-slate-300">
                            {wsConnected ? `${username} • Connected` : `${username} • Disconnected`}
                        </span>
                    </div>

                    {/* Mobile connection indicator */}
                    <div className="flex sm:hidden items-center">
                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${wsConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                    </div>

                    <Button
                        onClick={handleSaveCode}
                        variant="outline"
                        size="sm"
                        className="border-[#313244] hover:bg-[#313244] text-[#cdd6f4] bg-transparent cursor-pointer h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                        title="Save (Ctrl+S)"
                    >
                        {isLoading ? <LoadingIcon className="w-4 h-4 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> : <Save size={16} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
                        <span className="hidden sm:inline">Save</span>
                    </Button>

                    <Button
                        onClick={handleDownload}
                        variant="outline"
                        size="sm"
                        disabled={downloadLoading || !code}
                        className={`hover:bg-[#313244] text-[#cdd6f4] bg-transparent transition-colors duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm ${downloadError ? "bg-red-900/50" : ""}`}
                        title={downloadError || 'Download code'}
                    >
                        {downloadLoading ? <LoadingIcon className="w-4 h-4 sm:w-4 sm:h-4" /> : <DownloadIcon className="w-4 h-4 sm:w-4 sm:h-4" />}
                        {downloadError && !isMobile ? <span className="text-xs text-red-400 ml-2">{downloadError}</span> : null}
                    </Button>
                </div>
            </header>

            {/* Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* mobile overlay */}
                {isMobile && isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 animate-in fade-in-0"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div
                    className={`
                          ${isMobile ? "fixed left-0 top-12 bottom-0 z-50 w-64" : "relative"}
                          ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
                          ${!isMobile && isSidebarCollapsed ? "w-16" : "w-68"}
                          bg-[#181825] border-r border-[#313244] flex flex-col transition-all duration-300
                        `}
                >
                    <div className={`${!isSidebarCollapsed ? "border-b border-[#313244] p-3 sm:p-4" : ""}`}>
                        {!isSidebarCollapsed && (
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex bg-[#11111b] rounded-lg p-1">
                                    <button
                                        onClick={() => setSidebarView("languages")}
                                        className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${sidebarView === "languages" ? "bg-[#f38ba8] text-[#1e1e2e]" : "text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]"}`}
                                    >
                                        <Languages size={14} className="sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">Languages</span>
                                    </button>
                                    <button
                                        onClick={() => setSidebarView("members")}
                                        className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${sidebarView === "members" ? "bg-[#f38ba8] text-[#1e1e2e]" : "text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244]"}`}
                                    >
                                        <Users size={14} className="sm:w-4 sm:h-4" />
                                        <span className="hidden sm:inline">Members</span>
                                    </button>
                                </div>
                            </div>

                        )}

                        {!isSidebarCollapsed && (
                            <div>
                                {sidebarView === "languages" ? (
                                    <div>
                                        <h2 className="text-base sm:text-lg font-semibold text-[#f38ba8] mb-2">Languages</h2>
                                        <Badge variant="secondary" className="bg-[#313244] text-[#a6adc8] text-xs sm:text-sm">
                                            {languages.length} Available
                                        </Badge>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-base sm:text-lg font-semibold text-[#a6e3a1] mb-2">Room Members</h2>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-[#313244] text-[#a6adc8] text-xs sm:text-sm">
                                                {members.length} Total
                                            </Badge>
                                            <Badge variant="secondary" className="bg-[#a6e3a1]/20 text-[#a6e3a1] text-xs sm:text-sm">
                                                {onlineMembers.length} Online
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <ScrollArea className="flex-1 p-2">
                        {sidebarView === "languages" ? (
                            <div className="space-y-1">
                                {languages.map((language) => {
                                    const IconComponent = language.icon;
                                    return (
                                        <button
                                            key={language.id}
                                            onClick={() => handleLanguageChange(language)}
                                            className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all hover:bg-[#313244] ${selectedLanguage.id === language.id ? "bg-[#313244] border border-[#f38ba8]" : ""} ${isSidebarCollapsed ? "justify-center" : ""}`}
                                            title={isSidebarCollapsed ? language.name : ""}
                                        >
                                            <div className={`p-1.5 sm:p-2 rounded-md ${language.color} flex-shrink-0`}>
                                                <IconComponent size={14} className="sm:w-4 sm:h-4" />
                                            </div>
                                            {!isSidebarCollapsed && <span className="font-medium text-sm sm:text-base">{language.name}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-[#313244] transition-all ${isSidebarCollapsed ? "justify-center" : ""} ${member.isCurrent ? " bg-[#313244]/50" : ""}`}
                                        title={isSidebarCollapsed ? `${member.name} (${member.status})` : ""}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className={`w-6 h-6 sm:w-8 sm:h-8 ${member.color} rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold ${member.isCurrent ? "ring-2 ring-[#f38ba8]" : ""}`}>
                                                {member.avatar}
                                            </div>
                                            <div className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 border-[#181825] ${member.status === "online" ? "bg-[#a6e3a1]" : member.status === "away" ? "bg-[#f9e2af]" : "bg-[#6c7086]"}`} />
                                        </div>
                                        {!isSidebarCollapsed && (
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`font-medium truncate text-sm sm:text-base ${member.isCurrent ? "text-[#f38ba8]" : "text-[#cdd6f4]"}`}>
                                                        {member.name} {member.isCurrent && "(You)"}
                                                    </p>
                                                </div>
                                                <p className={`text-xs capitalize ${member.status === "online" ? "text-[#a6e3a1]" : member.status === "away" ? "text-[#f9e2af]" : "text-[#6c7086]"}`}>
                                                    {member.status}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Editor */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    <div className="h-12 sm:h-14 bg-[#181825] border-b border-[#313244] flex items-center justify-between px-2 sm:px-4 flex-shrink-0">
                        <div className="flex items-center gap-1 sm:gap-3">
                            {isMobile ? '' : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleSidebar}
                                    className="hover:bg-[#313244] text-[#cdd6f4] transition-all duration-300 h-8 w-8 sm:h-10 sm:w-10"
                                >
                                    <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
                                        <Menu
                                            size={18}
                                            className={`absolute transition-all duration-300 sm:w-5 sm:h-5 ${(isMobile && isSidebarOpen) || (!isMobile && !isSidebarCollapsed)
                                                ? 'opacity-0 -rotate-90 scale-75'
                                                : 'opacity-100 rotate-0 scale-100'
                                                }`}
                                        />
                                        <X
                                            size={18}
                                            className={`absolute transition-all duration-300 sm:w-5 sm:h-5 ${(isMobile && isSidebarOpen) || (!isMobile && !isSidebarCollapsed)
                                                ? 'opacity-100 rotate-0 scale-100'
                                                : 'opacity-0 rotate-90 scale-75'
                                                }`}
                                        />
                                    </div>
                                </Button>
                            )}
                            <div className={`p-1 sm:p-2 rounded-md ${selectedLanguage.color}`}>
                                <SelectedIcon size={16} className="sm:w-5 sm:h-5" />
                            </div>
                            <h1 className="text-sm sm:text-xl font-semibold truncate">{selectedLanguage.name} Editor</h1>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                                onClick={handleRunCode}
                                variant="outline"
                                size="sm"
                                disabled={isRunning || !code.trim()}
                                className="bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#1e1e2e] hover:text-[#6363f6] font-semibold disabled:opacity-50 cursor-pointer h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                            >
                                {isRunning ? (
                                    <>
                                        <LoadingIcon size={16} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                        <span className="hidden sm:inline">Running...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                        <span className="hidden sm:inline">Run</span>
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={() => terminalRef.current?.toggle?.()}
                                variant="outline"
                                size="icon"
                                className={`border-[#313244] hover:bg-[#313244] cursor-pointer h-8 w-8 sm:h-9 sm:w-9`}
                            >
                                <TerminalIcon size={16} className="sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                                onClick={handleCopyCode}
                                variant="outline"
                                size="sm"
                                className="hover:bg-[#313244] text-[#cdd6f4] bg-transparent cursor-pointer h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                                disabled={!code}
                            >
                                {isCopied ? <Check size={16} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" /> : <Copy size={16} className="sm:w-4 sm:h-4" />}
                                {isCopied ? <span className="hidden sm:inline">Copied!</span> : <span className="hidden sm:inline"></span>}
                            </Button>

                            <Button onClick={handleReview} className="bg-[#f38ba8] hover:bg-[#f38ba8]/80 text-[#1e1e2e] font-semibold cursor-pointer h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm" disabled={isLoading}>
                                <EnhanceIcon size={16} className="sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">FarM</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setChatOpen((v) => !v)}
                                className="border-[#313244] hover:bg-[#313244] cursor-pointer hover:text-[#f38ba8]/80 text-[#f38ba8] h-8 w-8 sm:h-9 sm:w-9"
                            >
                                <MessageCircle size={16} className="sm:w-4 sm:h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* code editor area */}
                    <div className="flex-1 p-2 sm:p-4 h-full editor-area">
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
                            onProcessInput={handleTerminalInput}
                        />
                    </div>
                </div>

                {/* AI panel */}
                <AiPanel
                    ref={aiPanelRef}
                    isOpen={isChatOpen}
                    onClose={() => setChatOpen(false)}
                    code={code}
                    selectedLanguage={selectedLanguage}
                    onUseCode={handleUseAiCode}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}