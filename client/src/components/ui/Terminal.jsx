import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/ScrollArea";
import { TerminalIcon, X } from "lucide-react";

/**
 * Terminal component
 *
 * Props:
 * - initialHeight (number) default 220
 * - minHeight (number) default 120
 * - maxHeight (number) default 0.9 * viewport or 800
 * - editorSelector (string) DOM selector for the editor container (default: '.editor-area')
 * - className (string) additional classes
 * - onClose (fn) optional callback when terminal closes
 *
 * Imperative methods via ref:
 * - open(), close(), toggle(), setHeight(h)
 *
 * Usage:
 * const terminalRef = useRef();
 * <Terminal ref={terminalRef} />
 * terminalRef.current.toggle();
 */
const Terminal = forwardRef(({
  initialHeight = 220,
  minHeight = 120,
  maxHeightPx = 800,
  editorSelector = ".editor-area",
  className = "",
  onClose,
}, ref) => {

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
  const [output, setOutput] = useState([
    { type: "info", content: "Welcome to GoonShareAI Terminal" },
    { type: "prompt", content: "$ " },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const historyIndex = useRef(-1);

  const inputRef = useRef(null);
  const rafRef = useRef(null);

  // Save height to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("goon_terminal_height", String(height));
    } catch {}
  }, [height]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // short delay to ensure animation/DOM is available
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcuts (toggle and close)
  useEffect(() => {
    const handler = (e) => {
      // Ctrl + `
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setIsOpen((v) => !v);
        return;
      }
      // Escape closes terminal if open
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  // Imperative handle for parent
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
    setHeight: (h) => setHeight(h),
  }));

  // Resize handlers (mouse + touch)
  useEffect(() => {
    let lastRaf = null;

    const onMove = (e) => {
      if (!isResizing) return;
      // support touch or mouse
      const clientY = ("touches" in e) ? (e.touches?.[0]?.clientY ?? 0) : e.clientY;

      const editor = document.querySelector(editorSelector);
      const viewportMax = Math.floor(window.innerHeight * 0.9);
      const maxAllowed = Math.min(maxHeightPx || viewportMax, viewportMax);

      if (!editor) {
        // fallback: compute height from bottom of viewport
        const newH = Math.max(minHeight, Math.min(maxAllowed, window.innerHeight - clientY));
        if (lastRaf) cancelAnimationFrame(lastRaf);
        lastRaf = requestAnimationFrame(() => setHeight(newH));
        return;
      }

      const rect = editor.getBoundingClientRect();
      // rect.bottom is bottom of editor; distance from mouse to bottom is new height
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
    };

    if (isResizing) {
      // prevent text selection while dragging
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

  // Terminal command handling + basic history navigation
  const addOutput = (content, type = "output") => {
    setOutput((prev) => [...prev, { type, content }]);
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const cmd = input.trim();
    if (!cmd) return;

    // push to history
    setHistory((h) => {
      const next = [...h, cmd].slice(-200);
      historyIndex.current = next.length;
      return next;
    });

    addOutput(`$ ${cmd}`, "command");

    // Very small fake processing to simulate a shell
    setTimeout(() => {
      if (cmd === "clear") {
        setOutput([{ type: "prompt", content: "$ " }]);
      } else if (cmd.startsWith("echo ")) {
        addOutput(cmd.substring(5));
        addOutput("$ ", "prompt");
      } else if (cmd === "ls" || cmd === "ls -la") {
        addOutput("drwxr-xr-x  3 user user  4096 Dec 15 10:30 src/");
        addOutput("drwxr-xr-x  2 user user  4096 Dec 15 10:30 components/");
        addOutput("-rw-r--r--  1 user user  1024 Dec 15 10:30 package.json");
        addOutput("$ ", "prompt");
      } else if (cmd === "pwd") {
        addOutput("/workspace/goonshare-editor");
        addOutput("$ ", "prompt");
      } else if (cmd === "help") {
        addOutput("Available commands:");
        addOutput("  ls, ls -la    - List directory contents");
        addOutput("  pwd           - Print working directory");
        addOutput("  echo <text>   - Display text");
        addOutput("  clear         - Clear terminal");
        addOutput("  cd <dir>      - Change directory (simulated)");
        addOutput("$ ", "prompt");
      } else if (cmd.startsWith("cd ")) {
        addOutput("$ ", "prompt");
      } else {
        addOutput(`bash: ${cmd}: command not found`, "error");
        addOutput("$ ", "prompt");
      }
    }, 60);

    setInput("");
  };

  // Keyboard: Ctrl+L clears, ArrowUp/Down history
  const onKeyDownInput = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setOutput([{ type: "prompt", content: "$ " }]);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = history;
      if (h.length === 0) return;
      historyIndex.current = Math.max(0, (historyIndex.current === -1 ? h.length : historyIndex.current) - 1);
      setInput(h[historyIndex.current] || "");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const h = history;
      if (h.length === 0) return;
      historyIndex.current = Math.min(h.length, (historyIndex.current === -1 ? h.length : historyIndex.current) + 1);
      if (historyIndex.current === h.length) setInput("");
      else setInput(h[historyIndex.current] || "");
      return;
    }
  };

  // When closed, optionally call onClose callback
  useEffect(() => {
    if (!isOpen) {
      onClose?.();
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Terminal"
      className={`absolute bottom-0 left-0 right-0 bg-[#0b0b12]/95 backdrop-blur-sm border-t border-[#313244] flex flex-col shadow-[0_-8px_30px_rgba(0,0,0,0.6)] z-50 ${className}`}
      style={{ height: `${height}px`, minHeight: `${minHeight}px` }}
    >
      {/* Drag handle - larger invisible hit area + small visual bar */}
      <div
        className="h-3 cursor-row-resize hover:bg-transparent relative group"
        onMouseDown={() => setIsResizing(true)}
        onTouchStart={() => setIsResizing(true)}
        aria-hidden
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-0.5 bg-[#45475a] rounded-full group-hover:bg-[#89b4fa] transition-colors" />
        </div>
      </div>

      {/* Header bar */}
      <div className="h-9 border-b border-[#313244] flex items-center px-2 bg-[#11111b]/90">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-[#0f1115] border-r border-[#313244] text-xs rounded-sm">
            <TerminalIcon size={12} className="text-[#cdd6f4]" />
            <span className="text-[#cdd6f4] font-medium">bash</span>
          </div>
          <div className="text-xs text-[#a6e3a1] font-medium ml-2">Terminal</div>
        </div>
        <div className="flex-1" />
        <div className="text-xs text-[#6c7086] mr-2">Ctrl+` to toggle • Esc to close</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-7 w-7 mr-1 hover:bg-[#313244] text-[#6c7086] hover:text-[#cdd6f4] rounded"
        >
          <X size={14} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e2e]">
        <ScrollArea className="flex-1 px-4 py-2">
          <div className="font-mono text-sm leading-relaxed break-words">
            {output.map((line, idx) => (
              <div
                key={idx}
                className={`
                  ${line.type === "command" ? "text-[#cdd6f4]" : ""}
                  ${line.type === "output" ? "text-[#a6adc8]" : ""}
                  ${line.type === "error" ? "text-[#f38ba8]" : ""}
                  ${line.type === "info" ? "text-[#89b4fa]" : ""}
                  ${line.type === "prompt" ? "text-[#a6e3a1] inline" : ""}
                  whitespace-pre-wrap
                `}
              >
                {line.content}
              </div>
            ))}

            {/* prompt line (input) */}
            <div className="flex items-center mt-2">
              <span className="text-[#a6e3a1] font-bold mr-2">$</span>
              <form onSubmit={handleSubmit} className="flex-1">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDownInput}
                  className="w-full bg-transparent text-[#cdd6f4] outline-none caret-[#cdd6f4] text-sm"
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
