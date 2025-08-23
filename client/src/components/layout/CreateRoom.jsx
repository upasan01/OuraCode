import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Play, ArrowRight, Copy } from "lucide-react";
import { createRoom, joinRoom } from "../../../server/api/roomApi";
import { useNavigate } from "react-router-dom";
import { LoadingIcon } from '../ui/Icons';
import { SiJavascript, SiPython, SiCplusplus, SiC } from 'react-icons/si';
import { FaJava } from "react-icons/fa";
import { TbBrandCSharp } from "react-icons/tb";
import { FaGolang } from "react-icons/fa6";


const programmingLanguages = [
    { value: 'c', label: "C", icon: SiC },
    { value: 'cpp', label: 'C++', icon: SiCplusplus },
    { value: 'py', label: 'Python', icon: SiPython },
    { value: 'java', label: 'Java', icon: FaJava },
    { value: 'js', label: 'JavaScript', icon: SiJavascript },
    { value: 'cs', label: 'C#', icon: TbBrandCSharp },
    { value: 'go', label: 'Go', icon: FaGolang },
]

const CreateRoom = ({ isJoinMode, setIsJoinMode }) => {
    const [selectedLanguage, setSelectedLanguage] = useState("")
    const [roomCode, setRoomCode] = useState("")
    const [isCustomRoom, setIsCustomRoom] = useState(false)
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

            navigate(`/room?roomId=${response.room.id}`, {
                state: {
                    language: selectedLanguage,
                    username: username,
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

            navigate(`/room?roomId=${roomCode}`, {
                state: {
                    language: response.room.language,
                    username: username,
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


    return (
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto my-8 sm:my-12 px-3 sm:px-4 md:px-0">
            <Card className="bg-[#313244]/50 border-[#45475a] backdrop-blur">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                    <CardTitle className="text-[#a6e3a1] text-sm sm:text-base md:text-lg font-mono">
                        <span className="text-[#f38ba8]">const</span> <span className="text-[#cdd6f4]">session</span>{" "}
                        <span className="text-[#89b4fa]">=</span>{" "}
                        <span className="text-[#fab387]">{isJoinMode ? "joinRoom" : "createRoom"}</span>
                        <span className="text-[#89b4fa]">()</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                    {errorMessage && (
                        <div className="p-2 sm:p-3 bg-[#f38ba8]/10 border border-[#f38ba8]/30 rounded-lg">
                            <div className="text-xs sm:text-sm text-[#f38ba8] font-mono">
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
                                    ? "bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#1e1e2e] flex-1 font-mono text-xs sm:text-sm"
                                    : "text-[#9399b2] hover:text-[#cdd6f4] hover:bg-[#313244] flex-1 font-mono text-xs sm:text-sm"
                            }
                        >
                            {"// create()"}
                        </Button>
                        <Button
                            onClick={() => setIsJoinMode(true)}
                            variant={isJoinMode ? "default" : "ghost"}
                            className={
                                isJoinMode
                                    ? "bg-[#89b4fa] hover:bg-[#74c7ec] text-[#1e1e2e] flex-1 font-mono text-xs sm:text-sm"
                                    : "text-[#9399b2] hover:text-[#cdd6f4] hover:bg-[#313244] flex-1 font-mono text-xs sm:text-sm"
                            }
                        >
                            {"// join()"}
                        </Button>
                    </div>

                    {/* Create Room Section */}
                    {!isJoinMode ? (
                        <>
                            {/* Username Section */}
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm text-[#9399b2] font-mono">
                                    <span className="text-[#f38ba8]">let</span> <span className="text-[#cdd6f4]">username</span>{" "}
                                    <span className="text-[#89b4fa]">=</span>
                                </label>
                                <Input
                                    value={username}
                                    placeholder="/* enter your username */"
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-[#11111b] border-[#45475a] text-[#cdd6f4] font-mono text-sm sm:text-base"
                                />
                            </div>

                            {/* Language Selection */}
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm text-[#9399b2] font-mono">
                                    <span className="text-[#f38ba8]">let</span> <span className="text-[#cdd6f4]">language</span>{" "}
                                    <span className="text-[#89b4fa]">=</span>
                                </label>
                                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                    <SelectTrigger className="bg-[#11111b] border-[#45475a] text-[#c8cad0] font-mono text-sm sm:text-base">
                                        <SelectValue placeholder="/* select programming language */" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#11111b] border-[#45475a]">
                                        {programmingLanguages.map((lang) => (
                                            <SelectItem
                                                key={lang.value}
                                                value={lang.value}
                                                className="text-[#cdd6f4] hover:bg-[#313244] font-mono text-sm sm:text-base"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <lang.icon size={16} className="text-[#a6e3a1]" />
                                                    {lang.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Room Code Section */}
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-2 sm:gap-2 md:gap-4">
                                    <Button
                                        onClick={() => setIsCustomRoom(false)}
                                        variant={!isCustomRoom ? "default" : "outline"}
                                        className={
                                            !isCustomRoom
                                                ? "bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#1e1e2e] font-mono text-xs sm:text-sm flex-1 min-w-0 px-2 sm:px-3"
                                                : "border-[#45475a] text-[#9399b2] hover:bg-[#313244] font-mono text-xs sm:text-sm flex-1 min-w-0 px-2 sm:px-3"
                                        }
                                    >
                                        <span className="truncate">{"Math.random()"}</span>
                                    </Button>
                                    <Button
                                        onClick={() => setIsCustomRoom(true)}
                                        variant={isCustomRoom ? "default" : "outline"}
                                        className={
                                            isCustomRoom
                                                ? "bg-[#cba6f7] hover:bg-[#b4befe] text-[#1e1e2e] font-mono text-xs sm:text-sm flex-1 min-w-0 px-2 sm:px-3"
                                                : "border-[#45475a] text-[#9399b2] hover:bg-[#313244] font-mono text-xs sm:text-sm flex-1 min-w-0 px-2 sm:px-3"
                                        }
                                    >
                                        <span className="truncate">{"custom.Id"}</span>
                                    </Button>
                                </div>

                                {isCustomRoom && (
                                    <div className="space-y-2">
                                        <label className="text-xs sm:text-sm text-[#9399b2] font-mono">
                                            <span className="text-[#f38ba8]">const</span>{" "}
                                            <span className="text-[#cdd6f4]">customName</span>{" "}
                                            <span className="text-[#89b4fa]">=</span>
                                        </label>
                                        <Input
                                            value={roomCode}
                                            onChange={(e) => setRoomCode(e.target.value)}
                                            placeholder="/* enter custom room name */"
                                            className="bg-[#11111b] border-[#45475a] text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#cba6f7] font-mono text-sm sm:text-base"
                                        />
                                    </div>
                                )}

                                <Button
                                    onClick={handleCreateRoom}
                                    disabled={!username || !selectedLanguage || isLoading}
                                    className="w-full bg-gradient-to-r from-[#a6e3a1] to-[#89b4fa] hover:from-[#94e2d5] hover:to-[#74c7ec] text-[#1e1e2e] font-semibold py-2 sm:py-3 font-mono text-sm sm:text-base"
                                >
                                    <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                    {"session.start()"}
                                    {isLoading ? <LoadingIcon className='ml-2' /> : <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Join Room Section */}
                            {/* Username Section */}
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm text-[#9399b2] font-mono">
                                    <span className="text-[#f38ba8]">let</span> <span className="text-[#cdd6f4]">username</span>{" "}
                                    <span className="text-[#89b4fa]">=</span>
                                </label>
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="/* enter your username */"
                                    className="bg-[#11111b] border-[#45475a] text-[#cdd6f4] font-mono text-sm sm:text-base"
                                />
                            </div>

                            {/* Room Code Section */}
                            <div className="space-y-3 sm:space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs sm:text-sm text-[#9399b2] font-mono">
                                        <span className="text-[#f38ba8]">const</span>{" "}
                                        <span className="text-[#cdd6f4]">roomCode</span> <span className="text-[#89b4fa]">=</span>
                                    </label>
                                    <Input
                                        value={roomCode}
                                        onChange={(e) => setRoomCode(e.target.value)}
                                        placeholder="/* enter room code */"
                                        className="bg-[#11111b] border-[#45475a] text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#89b4fa] text-center text-base sm:text-lg tracking-wider font-mono"
                                    />
                                </div>

                                <div className="text-center text-xs sm:text-sm text-[#6c7086] font-mono">
                                    {"/* ask your teammate for the room code */"}
                                </div>

                                <Button
                                    onClick={handleJoinRoom}
                                    disabled={!username || !roomCode || isLoading}
                                    className="w-full bg-gradient-to-r from-[#89b4fa] to-[#cba6f7] hover:from-[#74c7ec] hover:to-[#b4befe] text-[#1e1e2e] font-semibold py-2 sm:py-3 font-mono text-sm sm:text-base"
                                >
                                    {isLoading ? <LoadingIcon className='mr-2' /> : <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />}
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