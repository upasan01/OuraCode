import React, { useState } from 'react'
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Play, ArrowRight, Copy, Shuffle } from "lucide-react"

const programmingLanguages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
]

const CreateRoom = () => {
    const [selectedLanguage, setSelectedLanguage] = useState("")
    const [roomCode, setRoomCode] = useState("")
    const [isCustomRoom, setIsCustomRoom] = useState(false)
    const [isJoinMode, setIsJoinMode] = useState(false)

    const generateRoomCode = () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase()
        setRoomCode(code)
        setIsCustomRoom(false)
    }

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode)
    }
    return (
        <div className="mx-auto max-w-2xl mb-12">
            <Card className="bg-[#313244]/50 border-[#45475a] backdrop-blur">
                <CardHeader className="pb-4">
                    <CardTitle className="text-[#a6e3a1] text-lg font-mono">
                        <span className="text-[#f38ba8]">const</span> <span className="text-[#cdd6f4]">session</span>{" "}
                        <span className="text-[#89b4fa]">=</span>{" "}
                        <span className="text-[#fab387]">{isJoinMode ? "joinRoom" : "createRoom"}</span>
                        <span className="text-[#89b4fa]">()</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Mode Toggle */}
                    <div className="flex items-center justify-center space-x-1 bg-[#11111b]/50 rounded-lg p-1">
                        <Button
                            onClick={() => setIsJoinMode(false)}
                            variant={!isJoinMode ? "default" : "ghost"}
                            className={
                                !isJoinMode
                                    ? "bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#1e1e2e] flex-1 font-mono"
                                    : "text-[#9399b2] hover:text-[#cdd6f4] hover:bg-[#313244] flex-1 font-mono"
                            }
                        >
                            {"// create()"}
                        </Button>
                        <Button
                            onClick={() => setIsJoinMode(true)}
                            variant={isJoinMode ? "default" : "ghost"}
                            className={
                                isJoinMode
                                    ? "bg-[#89b4fa] hover:bg-[#74c7ec] text-[#1e1e2e] flex-1 font-mono"
                                    : "text-[#9399b2] hover:text-[#cdd6f4] hover:bg-[#313244] flex-1 font-mono"
                            }
                        >
                            {"// join()"}
                        </Button>
                    </div>

                    {!isJoinMode ? (
                        <>
                            {/* Language Selection */}
                            <div className="space-y-2">
                                <label className="text-sm text-[#9399b2] font-mono">
                                    <span className="text-[#f38ba8]">let</span> <span className="text-[#cdd6f4]">language</span>{" "}
                                    <span className="text-[#89b4fa]">=</span>
                                </label>
                                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                    <SelectTrigger className="bg-[#11111b] border-[#45475a] text-[#cdd6f4] font-mono">
                                        <SelectValue placeholder="/* select programming language */" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#11111b] border-[#45475a]">
                                        {programmingLanguages.map((lang) => (
                                            <SelectItem
                                                key={lang.value}
                                                value={lang.value}
                                                className="text-[#cdd6f4] hover:bg-[#313244] font-mono"
                                            >
                                                <span className="text-[#a6e3a1] mr-2">●</span>
                                                {lang.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Room Code Section */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <Button
                                        onClick={() => setIsCustomRoom(false)}
                                        variant={!isCustomRoom ? "default" : "outline"}
                                        className={
                                            !isCustomRoom
                                                ? "bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#1e1e2e] font-mono"
                                                : "border-[#45475a] text-[#9399b2] hover:bg-[#313244] font-mono"
                                        }
                                    >
                                        {"Math.random()"}
                                    </Button>
                                    <Button
                                        onClick={() => setIsCustomRoom(true)}
                                        variant={isCustomRoom ? "default" : "outline"}
                                        className={
                                            isCustomRoom
                                                ? "bg-[#cba6f7] hover:bg-[#b4befe] text-[#1e1e2e] font-mono"
                                                : "border-[#45475a] text-[#9399b2] hover:bg-[#313244] font-mono"
                                        }
                                    >
                                        {"custom.name"}
                                    </Button>
                                </div>

                                {!isCustomRoom ? (
                                    <div className="space-y-3">
                                        <div className="flex space-x-2">
                                            <Button
                                                onClick={generateRoomCode}
                                                className="bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#1e1e2e] font-semibold font-mono"
                                            >
                                                <Shuffle className="w-4 h-4 mr-2" />
                                                {"generateCode()"}
                                            </Button>
                                            {roomCode && (
                                                <Button
                                                    onClick={copyRoomCode}
                                                    variant="outline"
                                                    className="border-[#a6e3a1] text-[#a6e3a1] hover:bg-[#a6e3a1]/10 bg-transparent font-mono"
                                                >
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    {"copy()"}
                                                </Button>
                                            )}
                                        </div>
                                        {roomCode && (
                                            <div className="p-3 bg-[#11111b] border border-[#a6e3a1]/30 rounded-lg">
                                                <div className="text-xs text-[#9399b2] mb-1 font-mono">
                                                    <span className="text-[#f38ba8]">const</span>{" "}
                                                    <span className="text-[#cdd6f4]">roomId</span>{" "}
                                                    <span className="text-[#89b4fa]">=</span>
                                                </div>
                                                <div className="text-2xl font-bold text-[#a6e3a1] tracking-wider font-mono">
                                                    "{roomCode}"
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm text-[#9399b2] font-mono">
                                            <span className="text-[#f38ba8]">const</span>{" "}
                                            <span className="text-[#cdd6f4]">customName</span>{" "}
                                            <span className="text-[#89b4fa]">=</span>
                                        </label>
                                        <Input
                                            value={roomCode}
                                            onChange={(e) => setRoomCode(e.target.value)}
                                            placeholder="/* enter custom room name */"
                                            className="bg-[#11111b] border-[#45475a] text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#cba6f7] font-mono"
                                        />
                                    </div>
                                )}

                                <Button
                                    disabled={!selectedLanguage || !roomCode}
                                    className="w-full bg-gradient-to-r from-[#a6e3a1] to-[#89b4fa] hover:from-[#94e2d5] hover:to-[#74c7ec] text-[#1e1e2e] font-semibold py-3 font-mono"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    {"session.start()"}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Join Room Section */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-[#9399b2] font-mono">
                                        <span className="text-[#f38ba8]">const</span>{" "}
                                        <span className="text-[#cdd6f4]">roomCode</span> <span className="text-[#89b4fa]">=</span>
                                    </label>
                                    <Input
                                        value={roomCode}
                                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                        placeholder="/* 6-character room code */"
                                        className="bg-[#11111b] border-[#45475a] text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#89b4fa] text-center text-lg tracking-wider font-mono"
                                        maxLength={6}
                                    />
                                </div>

                                <div className="text-center text-sm text-[#6c7086] font-mono">
                                    {"/* ask your teammate for the room code */"}
                                </div>

                                <Button
                                    disabled={!roomCode || roomCode.length !== 6}
                                    className="w-full bg-gradient-to-r from-[#89b4fa] to-[#cba6f7] hover:from-[#74c7ec] hover:to-[#b4befe] text-[#1e1e2e] font-semibold py-3 font-mono"
                                >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    {"await joinSession()"}
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default CreateRoom
