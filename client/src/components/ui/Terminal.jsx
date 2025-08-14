"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/ScrollArea"
import { TerminalIcon, X } from "lucide-react"

const Terminal = ({ isOpen, onClose, height = 200, onHeightChange, className = "" }) => {
  const [output, setOutput] = useState("Welcome to GoonShareAI Terminal\n$ ")
  const [input, setInput] = useState("")
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing && onHeightChange) {
        const rect = document.querySelector(".editor-container")?.getBoundingClientRect()
        if (rect) {
          const newHeight = rect.bottom - e.clientY
          onHeightChange(Math.max(100, Math.min(400, newHeight)))
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, onHeightChange])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      const command = input.trim()
      setOutput((prev) => prev + command + "\n")

      setTimeout(() => {
        let response = ""
        if (command === "clear") {
          setOutput("$ ")
          setInput("")
          return
        } else if (command.startsWith("echo ")) {
          response = command.substring(5) + "\n"
        } else if (command === "ls") {
          response = "src/  components/  public/  package.json  README.md\n"
        } else if (command === "pwd") {
          response = "/workspace/goonshare-editor\n"
        } else if (command === "help") {
          response = "Available commands: ls, pwd, echo, clear, help\n"
        } else if (command.startsWith("cd ")) {
          response = `Changed directory to ${command.substring(3)}\n`
        } else {
          response = `Command '${command}' not found. Type 'help' for available commands.\n`
        }
        setOutput((prev) => prev + response + "$ ")
      }, 100)

      setInput("")
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`absolute bottom-4 left-4 right-4 bg-[#11111b] border border-[#313244] rounded-lg flex flex-col shadow-2xl ${className}`}
      style={{ height }}
    >
      {/* Resize Handle */}
      <div
        ref={resizeRef}
        className="h-1 bg-[#313244] cursor-row-resize hover:bg-[#f38ba8] transition-colors flex items-center justify-center group"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="w-8 h-0.5 bg-[#6c7086] rounded-full group-hover:bg-[#f38ba8] transition-colors" />
      </div>

      {/* Header */}
      <div className="h-10 border-b border-[#313244] flex items-center justify-between px-3 bg-[#181825] rounded-t-lg">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-[#a6e3a1]" />
          <span className="text-sm font-medium text-[#a6e3a1]">Terminal</span>
          <div className="w-2 h-2 bg-[#a6e3a1] rounded-full animate-pulse" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 hover:bg-[#313244] text-[#6c7086] hover:text-[#f38ba8]"
        >
          <X size={12} />
        </Button>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-3">
          <pre className="text-sm font-mono text-[#cdd6f4] whitespace-pre-wrap leading-relaxed">{output}</pre>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-[#313244] p-3 bg-[#11111b]">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <span className="text-[#a6e3a1] font-mono text-sm font-bold">$</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent text-[#cdd6f4] font-mono text-sm outline-none placeholder:text-[#6c7086] caret-[#f38ba8]"
              placeholder="Enter command... (try: ls, pwd, echo, help)"
              autoComplete="off"
              autoFocus
            />
          </form>
        </div>
      </div>
    </div>
  )
}

export { Terminal }
