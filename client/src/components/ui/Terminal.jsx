// components/ui/Terminal.jsx
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/ScrollArea";
import { TerminalIcon, X } from "lucide-react";

const Terminal = forwardRef((
  {
    initialHeight = 220,
    minHeight = 120,
    maxHeightPx = 800,
    editorSelector = ".editor-area",
    className = "",
    onClose,
    audioList: audioListProp = null,
  },
  ref
) => {
  const DEFAULT_AUDIO_LIST = [
    "/assets/sounds/Goon-1.m4a",
    "/assets/sounds/Goon-2.m4a",
    "/assets/sounds/Goon-3.m4a",
    "/assets/sounds/Goon-4.m4a",
    "/assets/sounds/Goon-5.m4a",
    
  ];

  const audioList = useRef(audioListProp || DEFAULT_AUDIO_LIST);
  const audioPoolRef = useRef([]);
  const currentAudioRef = useRef(null);
  const lastIndexRef = useRef(null);

  const [isGoonPlaying, setIsGoonPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);

  const [goonVolume, setGoonVolume] = useState(() => {
    try {
      const v = localStorage.getItem("goon_volume");
      return v ? Number(v) : 0.7;
    } catch {
      return 0.7;
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const savedHeight = (() => {
    try {
      const v = localStorage.getItem("goon_terminal_height");
      return v ? Number(v) : initialHeight;
    } catch {
      return initialHeight;
    }
  })();
  const [height, setHeight] = useState(savedHeight);
  const [isResizing, setIsResizing] = useState(false);

  const [output, setOutput] = useState([{ type: "info", content: "Welcome to GoonShareAI Terminal" }]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const historyIndex = useRef(-1);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Persist state
  useEffect(() => {
    try { localStorage.setItem("goon_terminal_height", String(height)); } catch { }
  }, [height]);
  useEffect(() => {
    try { localStorage.setItem("goon_volume", String(goonVolume)); } catch { }
  }, [goonVolume]);

  // Robust scroll helper: ensures messagesEndRef and input are visible.
  const scrollToBottom = (opts = { smooth: true }) => {
    const smooth = !!opts.smooth;
    // Use rAF to wait for DOM paint. Also add a tiny timeout fallback.
    try {
      requestAnimationFrame(() => {
        try {
          if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === "function") {
            messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
          }
        } catch { }
        // Also ensure input is in view (cursor)
        try {
          if (inputRef.current && typeof inputRef.current.scrollIntoView === "function") {
            inputRef.current.scrollIntoView({ behavior: "auto", block: "nearest" });
          }
        } catch { }
      });

      // Fallback in case rAF isn't enough (some browsers)
      setTimeout(() => {
        try {
          if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === "function") {
            messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
          }
        } catch { }
        try {
          if (inputRef.current && typeof inputRef.current.scrollIntoView === "function") {
            inputRef.current.scrollIntoView({ behavior: "auto", block: "nearest" });
          }
        } catch { }
      }, 50);
    } catch { }
  };

  // Auto-scroll when output changes
  useEffect(() => {
    scrollToBottom({ smooth: true });
  }, [output]);

  // Scroll when opening
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => scrollToBottom({ smooth: false }), 80);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Helper to add output lines
  const addOutput = (content, type = "output") => {
    setOutput((prev) => [...prev, { type, content }]);
  };

  // Preload audio pool
  useEffect(() => {
    audioPoolRef.current = audioList.current
      .map((src) => {
        try {
          const a = new Audio(src);
          a.preload = "auto";
          a.volume = goonVolume;
          a.addEventListener("error", () => { });
          return a;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return () => {
      audioPoolRef.current.forEach((a) => {
        try { a.pause(); a.src = ""; } catch { }
      });
      audioPoolRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    audioPoolRef.current.forEach((a) => { try { a.volume = goonVolume; } catch { } });
    if (currentAudioRef.current) {
      try { currentAudioRef.current.volume = goonVolume; } catch { }
    }
  }, [goonVolume]);

  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        try { currentAudioRef.current.pause(); currentAudioRef.current.src = ""; } catch { }
      }
    };
  }, []);

  // Play random track avoiding immediate repeat
  const playRandomGoon = async () => {
    const list = audioList.current;
    if (!list || list.length === 0) {
      addOutput("No goon audio configured.", "error");
      return;
    }

    if (currentAudioRef.current) {
      try { currentAudioRef.current.pause(); currentAudioRef.current.currentTime = 0; } catch { }
    }

    let idx;
    if (list.length === 1) {
      idx = 0;
    } else {
      let attempts = 0;
      do {
        idx = Math.floor(Math.random() * list.length);
        attempts++;
      } while (idx === lastIndexRef.current && attempts < 10);
      if (idx === lastIndexRef.current) idx = (lastIndexRef.current + 1) % list.length;
    }
    lastIndexRef.current = idx;

    const src = list[idx];
    const audio = new Audio(src);
    audio.volume = goonVolume;
    currentAudioRef.current = audio;
    setCurrentTrack(src);
    setIsGoonPlaying(true);

    try {
      await audio.play();
      const fileName = src.split("/").pop();
      addOutput(`Playing: ${fileName}`, "info");
      // ensure visible immediately after message added
      scrollToBottom({ smooth: true });

      const onEnd = () => {
        setIsGoonPlaying(false);
        setCurrentTrack(null);
        currentAudioRef.current = null;
        audio.removeEventListener("ended", onEnd);
      };
      audio.addEventListener("ended", onEnd);
    } catch (err) {
      setIsGoonPlaying(false);
      setCurrentTrack(null);
      currentAudioRef.current = null;
      addOutput(`Failed to play audio: ${err?.message || err}`, "error");
      scrollToBottom({ smooth: true });
    }
  };

  const stopGoon = () => {
    const a = currentAudioRef.current;
    if (a) {
      try { a.pause(); a.currentTime = 0; } catch { }
      currentAudioRef.current = null;
    }
    setIsGoonPlaying(false);
    setCurrentTrack(null);
    addOutput("Stopped goon audio.", "info");
    scrollToBottom({ smooth: true });
  };

  const setGoonVolumeCmd = (v) => {
    const vol = Number(v);
    if (Number.isNaN(vol) || vol < 0 || vol > 1) {
      addOutput("Volume must be a number between 0 and 1.", "error");
      scrollToBottom({ smooth: true });
      return;
    }
    setGoonVolume(vol);
    addOutput(`Goon volume set to ${vol}`, "info");
    scrollToBottom({ smooth: true });
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setIsOpen((v) => !v);
        return;
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const tid = setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom({ smooth: false });
      }, 80);
      return () => clearTimeout(tid);
    }
  }, [isOpen]);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
    setHeight: (h) => setHeight(h),
  }));

  const prevOpenRef = useRef(isOpen);
  useEffect(() => {
    if (prevOpenRef.current && !isOpen) {
      onClose?.();
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, onClose]);

  // Resizing: ensure we scroll to bottom after resize end
  useEffect(() => {
    let lastRaf = null;
    const onMove = (e) => {
      if (!isResizing) return;
      const clientY = "touches" in e ? e.touches?.[0]?.clientY ?? 0 : e.clientY;
      const editor = document.querySelector(editorSelector);
      const viewportMax = Math.floor(window.innerHeight * 0.9);
      const maxAllowed = Math.min(maxHeightPx || viewportMax, viewportMax);

      if (!editor) {
        const newH = Math.max(minHeight, Math.min(maxAllowed, window.innerHeight - clientY));
        if (lastRaf) cancelAnimationFrame(lastRaf);
        lastRaf = requestAnimationFrame(() => setHeight(newH));
        return;
      }

      const rect = editor.getBoundingClientRect();
      const newHeight = Math.max(minHeight, Math.min(maxAllowed, Math.round(rect.bottom - clientY)));
      if (lastRaf) cancelAnimationFrame(lastRaf);
      lastRaf = requestAnimationFrame(() => setHeight(newHeight));
    };

    const onUp = () => {
      if (!isResizing) return;
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (lastRaf) cancelAnimationFrame(lastRaf);
      // ensure after resize the cursor/input is visible
      setTimeout(() => scrollToBottom({ smooth: false }), 30);
    };

    if (isResizing) {
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend", onUp);
    }

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (lastRaf) cancelAnimationFrame(lastRaf);
    };
  }, [isResizing, editorSelector, minHeight, maxHeightPx]);

  // Command submit + history navigation
  const handleSubmit = (e) => {
    e?.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    setHistory((h) => {
      const next = [...h, cmd].slice(-200);
      historyIndex.current = next.length;
      return next;
    });

    addOutput(`$ ${cmd}`, "command");
    scrollToBottom({ smooth: true });

    setTimeout(() => {
      if (cmd === "goon" || cmd === "goon play") {
        playRandomGoon();
      } else if (cmd === "goon stop") {
        stopGoon();
      } else if (cmd.startsWith("goon volume ")) {
        const parts = cmd.split(" ");
        const v = parts[2];
        setGoonVolumeCmd(v);
      } else if (cmd === "goon status") {
        addOutput(`Goon playing: ${isGoonPlaying ? "Yes" : "No"}${currentTrack ? ` — ${currentTrack.split("/").pop()}` : ""}`, "info");
        scrollToBottom({ smooth: true });
      } else if (cmd === "clear" || cmd === "cls") {
        setOutput([]);
      } else if (cmd.startsWith("echo ")) {
        addOutput(cmd.substring(5));
        scrollToBottom({ smooth: true });
      } else if (cmd === "ls" || cmd === "ls -la") {
        addOutput("drwxr-xr-x  3 user user  4096 Dec 15 10:30 src/");
        addOutput("drwxr-xr-x  2 user user  4096 Dec 15 10:30 components/");
        addOutput("-rw-r--r--  1 user user  1024 Dec 15 10:30 package.json");
        scrollToBottom({ smooth: true });
      } else if (cmd === "pwd") {
        addOutput("/workspace/goonshare-editor");
        scrollToBottom({ smooth: true });
      } else if (cmd === "help") {
        addOutput("Available commands:");
        addOutput("  ls, ls -la    - List directory contents");
        addOutput("  pwd           - Print working directory");
        addOutput("  echo <text>   - Display text");
        addOutput("  clear         - Clear terminal");
        addOutput("  cd <dir>      - Change directory (simulated)");
        scrollToBottom({ smooth: true });
      } else if (cmd.startsWith("cd ")) {
        // simulated cd — no added output
      } else {
        addOutput(`bash: ${cmd}: command not found`, "error");
        scrollToBottom({ smooth: true });
      }
    }, 60);

    setInput("");
  };

  const onKeyDownInput = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setOutput([]);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = history;
      if (h.length === 0) return;
      historyIndex.current = Math.max(0, (historyIndex.current === -1 ? h.length : historyIndex.current) - 1);
      setInput(h[historyIndex.current] || "");
      // ensure that updated input and cursor remain visible
      setTimeout(() => scrollToBottom({ smooth: false }), 0);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const h = history;
      if (h.length === 0) return;
      historyIndex.current = Math.min(h.length, (historyIndex.current === -1 ? h.length : historyIndex.current) + 1);
      if (historyIndex.current === h.length) setInput("");
      else setInput(h[historyIndex.current] || "");
      // ensure that updated input and cursor remain visible
      setTimeout(() => scrollToBottom({ smooth: false }), 0);
      return;
    }
  };

  // ensure input focus scrolls into view (user clicks the input)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onFocus = () => scrollToBottom({ smooth: false });
    el.addEventListener("focus", onFocus);
    return () => el.removeEventListener("focus", onFocus);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Terminal"
      className={`absolute bottom-0 left-0 right-0 bg-[#1e1e2e] border-t border-[#313244] font-mono flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.3)] z-50 ${className}`}
      style={{ height: `${height}px`, minHeight: `${minHeight}px` }}
    >
      {/* Drag handle */}
      <div className="h-1 cursor-row-resize hover:bg-[#a6e3a1] bg-[#313244] transition-colors relative group" onMouseDown={() => setIsResizing(true)}
        onTouchStart={() => setIsResizing(true)}
        aria-hidden >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-0.5 bg-[#45475a] rounded-full group-hover:bg-[#a6e3a1]" />
        </div>
      </div>

      {/* Header */}
      <div className="h-8 border-b border-[#313244] flex items-center px-3 bg-[#181825] text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1e1e2e] border-r border-[#313244] rounded-t-sm">
            <TerminalIcon size={12} className="text-[#a6e3a1]" />
            <span className="text-[#cdd6f4] font-medium">bash</span>
          </div>

          <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-[#313244] text-[#6c7086] hover:text-[#cdd6f4] rounded">
            <span className="text-xs">+</span>
          </Button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 text-[#6c7086]">
          <span className="text-xs">Terminal</span>
          <div className="w-px h-3 bg-[#313244]" />
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-5 w-5 hover:bg-[#313244] text-[#6c7086] hover:text-[#f38ba8] rounded">
            <X size={12} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e2e]">
        <ScrollArea className="flex-1 px-3 py-2">
          <div className="font-mono text-sm leading-6">
            {output.map((line, idx) => (
              <div key={idx} className={`
                ${line.type === "command" ? "text-[#cdd6f4] font-medium" : ""}
                ${line.type === "output" ? "text-[#a6adc8]" : ""}
                ${line.type === "error" ? "text-[#f38ba8] font-medium" : ""}
                ${line.type === "info" ? "text-[#89b4fa]" : ""}
                whitespace-pre-wrap break-words
              `}>
                {line.content}
              </div>
            ))}

            <div ref={messagesEndRef} />

            {/* Input prompt line */}
            <div className="flex items-center mt-1 group">
              <span className="text-[#89b4fa] font-medium mr-2 font-mono select-none">~</span>
              <span className="text-[#a6e3a1] font-bold mr-2 font-mono select-none">$</span>
              <form onSubmit={handleSubmit} className="flex-1">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDownInput}
                  className="w-full bg-transparent text-[#cdd6f4] outline-none caret-[#a6e3a1] text-sm font-mono placeholder:text-[#6c7086]"
                  placeholder="Type a command..."
                  autoComplete="off"
                  spellCheck="false"
                />
              </form>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
});

export { Terminal };
