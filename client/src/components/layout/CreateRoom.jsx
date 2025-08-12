import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Play, ArrowRight, Copy, Shuffle } from "lucide-react";
import { createRoom, joinRoom } from "../../api/roomApi";
import { useNavigate } from "react-router-dom";
import { LoadingIcon } from '../ui/Icons';


const programmingLanguages = [
    {value: 'c', label :"C"},
    { value: 'js', label: 'JavaScript' },
    { value: 'py', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cs', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
]

const CreateRoom = () => {
    const [selectedLanguage, setSelectedLanguage] = useState("")
    const [roomCode, setRoomCode] = useState("")
    const [isCustomRoom, setIsCustomRoom] = useState(false)
    const [isJoinMode, setIsJoinMode] = useState(false)
    const [username, setUsername] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // For Room creation
    const handleCreateRoom = async () => {
        setErrorMessage("");
        setIsLoading(true);
        if (!username || !selectedLanguage) {
            setErrorMessage("Please enter a username and select a programming language.");
            return;
        }
        try {
            const payload = { username, language: selectedLanguage };

            // Only add roomId if it's a custom room
            if (isCustomRoom && roomCode) {
                payload.roomId = roomCode;
            }

            const response = await createRoom(payload);
            console.log("Room created successfully:", response);

            // Update the roomCode state with the backend-generated or confirmed code
            setRoomCode(response.room.roomId);

            navigate(`/?roomId=${response.room.roomId}&username=${username}`, {
                state: {
                    language: selectedLanguage,
                }
            });
        } catch (error) {
            if (error.response) {
                setErrorMessage(error.response?.data?.message || "Failed to create room. Please try again.");
            } else {
                setErrorMessage("Failed to connect to the server.")
            }
        }
        setIsLoading(false);
    };

    // For Room joining
    const handleJoinRoom = async () => {
        setErrorMessage("");
        setIsLoading(true);
        if (!roomCode || !username) {
            setErrorMessage("Please enter a room code and username.");
            return;
        }
        try {
            const response = await joinRoom({ roomId: roomCode, username });
            console.log("Joined room successfully:", response);
            console.log("Complete room data:", response.room);
            console.log("Room language from backend:", response.room.language);

            navigate(`/?roomId=${roomCode}&username=${username}`, {
                state: {
                    language: response.room.language, 
                    roomData: response.room 
                }
            });
        } catch (error) {
            if (error.response) {
                setErrorMessage(error.response?.data?.message || "Failed to join room. Please try again.");
            } else {
                setErrorMessage("Failed to connect to the server.");
            }

        }
        setIsLoading(false);
    };



    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode)
    }
    return (
        <div id= "room" className="mx-auto max-w-2xl mb-12">
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
                    {/* Error Message Display */}
                    {errorMessage && (
                        <div className="p-3 bg-[#f38ba8]/10 border border-[#f38ba8]/30 rounded-lg">
                            <div className="text-sm text-[#f38ba8] font-mono">
                                <span className="text-[#f38ba8]">error</span>
                                <span className="text-[#89b4fa]">:</span> {errorMessage}
                            </div>
                        </div>
                    )}

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
                            {/* Username Section */}
                            <div className="space-y-2 ">
                                <label className="text-sm text-[#9399b2] font-mono">
                                    <span className="text-[#f38ba8]">let</span> <span className="text-[#cdd6f4]">username</span>{" "}
                                    <span className="text-[#89b4fa]">=</span>
                                </label>
                                <Input
                                    value={username}
                                    placeholder="/* enter your username */"
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-[#11111b] border-[#45475a] text-[#cdd6f4] font-mono "
                                />
                            </div>

                            {/* Language Selection */}
                            <div className="space-y-2">
                                <label className="text-sm text-[#9399b2] font-mono">
                                    <span className="text-[#f38ba8]">let</span> <span className="text-[#cdd6f4]">language</span>{" "}
                                    <span className="text-[#89b4fa]">=</span>
                                </label>
                                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                    <SelectTrigger className="bg-[#11111b] border-[#45475a] text-[#c8cad0] font-mono">
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
                                    onClick={handleCreateRoom}
                                    disabled={!username || !selectedLanguage || isLoading}
                                    className="w-full bg-gradient-to-r from-[#a6e3a1] to-[#89b4fa] hover:from-[#94e2d5] hover:to-[#74c7ec] text-[#1e1e2e] font-semibold py-3 font-mono"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    {"session.start()"}
                                    {isLoading ? <LoadingIcon className='m-2' /> : <ArrowRight className="w-4 h-4 ml-2" />}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Join Room Section */}

                            {/* Username Section */}
                            <div className="space-y-2">
                                <label className="text-sm text-[#9399b2] font-mono">
                                    <span className="text-[#f38ba8]">let</span> <span className="text-[#cdd6f4]">username</span>{" "}
                                    <span className="text-[#89b4fa]">=</span>
                                </label>
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-[#11111b] border-[#45475a] text-[#cdd6f4] font-mono"
                                />
                            </div>

                            {/* Room Code Section */}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-[#9399b2] font-mono ">
                                        <span className="text-[#f38ba8]">const</span>{" "}
                                        <span className="text-[#cdd6f4]">roomCode</span> <span className="text-[#89b4fa]">=</span>
                                    </label>
                                    <Input
                                        value={roomCode}
                                        onChange={(e) => setRoomCode(e.target.value)}
                                        placeholder="/* enter room code */"
                                        className="bg-[#11111b] border-[#45475a] text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#89b4fa] text-center text-lg tracking-wider font-mono"
                                    />
                                </div>

                                <div className="text-center text-sm text-[#6c7086] font-mono">
                                    {"/* ask your teammate for the room code */"}
                                </div>

                                <Button
                                    onClick={handleJoinRoom}
                                    disabled={!username || !roomCode || isLoading}
                                    className="w-full bg-gradient-to-r from-[#89b4fa] to-[#cba6f7] hover:from-[#74c7ec] hover:to-[#b4befe] text-[#1e1e2e] font-semibold py-3 font-mono"
                                >
                                    {isLoading ? <LoadingIcon className='m-2' /> : <ArrowRight className="w-4 h-4 mr-2" />}
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
