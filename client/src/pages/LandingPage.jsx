import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Particles from "../components/ui/particles";
import Nav from "../components/layout/Nav";
import {
  Code2,
  Share2,
  Terminal,
  Play,
  MessageSquare,
  User,
  DiscIcon as Discord,
  Users,
  Github,
  Twitter,
} from "lucide-react";
import CreateRoom from "../components/layout/CreateRoom";
import TextType from "../components/ui/TextType";

export default function GoonShareAILanding() {
  const [isJoinMode, setIsJoinMode] = useState(false);
  const handleCreateNowClick = () => {
    setIsJoinMode(false);
    const roomSection = document.getElementById("room");
    if (roomSection) {
      roomSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleJoinNowClick = () => {
    setIsJoinMode(true);
    const roomSection = document.getElementById("room");
    if (roomSection) {
      roomSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <main
      id="home"
      className="relative min-h-screen w-full bg-gradient-to-br from-[#11111b] via-[#181825] to-[#1e1e2e] font-mono"
    >
      {/* Background */}
      <div className="fixed inset-0 w-full h-full z-10">
        <Particles />
      </div>
      <Nav onCreateNowClick={handleCreateNowClick}
        onJoinNowClick={handleJoinNowClick} />
      {/* Hero Section */}
      <section className="relative overflow-hidden md:py-10 z-0">
        <div className="absolute inset-0"></div>

        <div className="w-full max-w-7xl mx-auto relative px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-3 sm:mb-4 bg-[#313260]/50 text-[#a6e3a1] border-[#313244] hover:bg-[#313244]/70 mt-4 sm:mt-6 text-xs sm:text-sm">
              <Terminal className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              {"/* real-time vibe coding */"}
            </Badge>

            <h1 className="mb-4 sm:mb-6 text-2xl sm:text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl xl:text-7xl">
              <TextType
                text={["Vibe.To.Code", "LazyAzz", "Infinite.Aura!"]}
                typingSpeed={40}
                pauseDuration={2000}
                showCursor={true}
                cursorCharacter="_"
              />
              <div className="bg-gradient-to-r from-[#f38ba8] via-[#fab387] to-[#a6e3a1] bg-clip-text text-transparent">
                function main
              </div>
              <span className="text-[#89b4fa]">(</span>
              <span className="bg-gradient-to-r from-[#a6e3a1] via-[#89b4fa] to-[#cba6f7] bg-clip-text text-transparent">
                farm_Aura
              </span>
              <span className="text-[#89b4fa]">)</span>
              <div className="text-[#6c7086]"> {"{"}</div>
            </h1>

            <p className="mx-auto mb-8 sm:mb-12 max-w-2xl text-xs sm:text-sm md:text-base lg:text-lg text-[#9399b2] leading-relaxed">
              <span className="text-[#6c7086]">{"/**"}</span>
              <br />
              <span className="text-[#6c7086]">
                {" * Real-time code sharing (aka real-time chaos)."}
              </span>
              <br />
              <span className="text-[#6c7086]">
                {" * AI chat included, because we gave up too."}
              </span>
              <br />
              <span className="text-[#6c7086]">
                {" * @param {Object} session - Debugging, aka crying together"}
              </span>
              <br />
              <span className="text-[#6c7086]">
                {" * @returns {Promise<Success>} - If it runs, we’re shocked"}
              </span>
              <br />
              <span className="text-[#6c7086]">{" */"}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Room Creation/Join Section */}
      <section id="room" className="relative z-20 sm:py-25">
        <CreateRoom isJoinMode={isJoinMode}
                    setIsJoinMode={setIsJoinMode} />
      </section>

      {/* Features Cards */}
      <section
        id="features"
        className="py-12 sm:py-20 md:py-32 relative overflow-hidden"
      >
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 relative z-20">
          <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-[#a6e3a1]">
              {"/* Feature Circus */"}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#9399b2]">
              {
                "// All-in-one collab coding setup: code, sync, and silently judge your teammates."
              }
            </p>
          </div>

          <div className="grid gap-2 grid-cols-2 sm:gap-4 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <Card className="bg-[#313244]/50 border-[#45475a] hover:border-[#fab387]/50 transition-all duration-300 group min-w-0">
              <CardHeader className="pb-1 sm:pb-2 md:pb-4 px-3 sm:px-4 md:px-6">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-[#fab387]/20 group-hover:bg-[#fab387]/30 transition-colors">
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#fab387]" />
                </div>
                <CardTitle className="text-sm sm:text-base md:text-lg text-[#fab387] mt-2">
                  share.export()
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-4 md:px-6">
                <p className="text-xs sm:text-sm text-[#9399b2] leading-relaxed">
                  {
                    "/*  Why vibe-code solo when you can squad up with your equally unhinged coder friends 💻✨. Create a Room, vibe together, and farm infinite Aura like it's XP in a busted RPG. */"
                  }
                </p>
                <div className="mt-2 text-xs text-[#6c7086]">
                  {"room.create(ID)"}
                </div>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="bg-[#313244]/50 border-[#45475a] hover:border-[#a6e3a1]/50 transition-all duration-300 group min-w-0">
              <CardHeader className="pb-1 sm:pb-2 md:pb-4 px-3 sm:px-4 md:px-6">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-[#a6e3a1]/20 group-hover:bg-[#a6e3a1]/30 transition-colors">
                  <Code2 className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#a6e3a1]" />
                </div>
                <CardTitle className="text-sm sm:text-base md:text-lg text-[#a6e3a1] mt-2">
                  realtime.sync()
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-4 md:px-6">
                <p className="text-xs sm:text-sm text-[#9399b2] leading-relaxed">
                  {
                    "/* Live cursors so you can instantly see which clown is breaking the code 🤡, instant sync so no one rage-quits from being left behind, and real-time editing because chaos loves company. */"
                  }
                </p>
                <div className="mt-2 text-xs text-[#6c7086]">
                  {"websocket.connect()"}
                </div>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="bg-[#313244]/50 border-[#45475a] hover:border-[#cba6f7]/50 transition-all duration-300 group min-w-0">
              <CardHeader className="pb-1 sm:pb-2 md:pb-4 px-3 sm:px-4 md:px-6">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-[#cba6f7]/20 group-hover:bg-[#cba6f7]/30 transition-colors">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#cba6f7]" />
                </div>
                <CardTitle className="text-sm sm:text-base md:text-lg text-[#cba6f7] mt-2">
                  chat.connect()
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-4 md:px-6">
                <p className="text-xs sm:text-sm text-[#9399b2] leading-relaxed">
                  {
                    "/* Built-in AI chat. Perfect for when the squad's collective IQ drops to room temperature 🥶.  Aura can upgrade your code… or just code it all for you (guess which one's the fan favorite). */"
                  }
                </p>
                <div className="mt-2 text-xs text-[#6c7086]">
                  {"AI.enable(true)"}
                </div>
              </CardContent>
            </Card>

            {/* Card 4 */}
            <Card className="bg-[#313244]/50 border-[#45475a] hover:border-[#89b4fa]/50 transition-all duration-300 group min-w-0">
              <CardHeader className="pb-1 sm:pb-2 md:pb-4 px-3 sm:px-4 md:px-6">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-[#89b4fa]/20 group-hover:bg-[#89b4fa]/30 transition-colors">
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#89b4fa]" />
                </div>
                <CardTitle className="text-sm sm:text-base md:text-lg text-[#89b4fa] mt-2">
                  execute.instantly()
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-4 md:px-6">
                <p className="text-xs sm:text-sm text-[#9399b2] leading-relaxed">
                  {
                    "/* Run code in the browser with Aura++ — instant, no downloads, no excuses. Supports more languages than you'll ever actually touch (yes, it has a compiler and runtime built-in 🤯). */"
                  }
                </p>
                <div className="mt-2 text-xs text-[#6c7086]">
                  {"runtime.exec(code)"}
                </div>
              </CardContent>
            </Card>

            {/* Card 5 */}
            <Card className="bg-[#313244]/50 border-[#45475a] hover:border-[#94e2d5]/50 transition-all duration-300 group min-w-0">
              <CardHeader className="pb-1 sm:pb-2 md:pb-4 px-3 sm:px-4 md:px-6">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-[#94e2d5]/20 group-hover:bg-[#94e2d5]/30 transition-colors">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#94e2d5]" />
                </div>
                <CardTitle className="text-sm sm:text-base md:text-lg text-[#94e2d5] mt-2">
                  track.work()
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-4 md:px-6">
                <p className="text-xs sm:text-sm text-[#9399b2] leading-relaxed">
                  {
                    "/*  See who's really building 🛠️ and who's just lowkey loafing 😴 with the Members option — spot the grinders, the lurkers, and that one guy “debugging” by staring at the screen 👀.*/"
                  }
                </p>
                <div className="mt-2 text-xs text-[#6c7086]">
                  {"push.work('feat')"}
                </div>
              </CardContent>
            </Card>

            {/* Card 6 */}
            <Card className="bg-[#313244]/50 border-[#45475a] hover:border-[#f9e2af]/50 transition-all duration-300 group min-w-0">
              <CardHeader className="pb-1 sm:pb-2 md:pb-4 px-3 sm:px-4 md:px-6">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-[#f9e2af]/20 group-hover:bg-[#f9e2af]/30 transition-colors">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#f9e2af]" />
                </div>
                <CardTitle className="text-sm sm:text-base md:text-lg text-[#f9e2af] mt-2">
                  work.loner()
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-4 md:px-6">
                <p className="text-xs sm:text-sm text-[#9399b2] leading-relaxed font-mono">
                  {
                    "/* For when you're on that solo grind 🚀 — no friends, no drama. Just vibe and code alone (keep that roomId lowkey 🤫) */"
                  }
                </p>
                <div className="mt-2 text-xs text-[#6c7086]">
                  {"selflove.enable()"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Room-less Join Section */}
      <section className="py-12 sm:py-20 md:py-32 border-t border-[#313244] relative">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight">
              <span className="text-[#f38ba8]">if</span>
              <span className="text-[#cdd6f4]"> (</span>
              <span className="text-[#fab387]">ready</span>
              <span className="text-[#cdd6f4]"> </span>
              <span className="text-[#89b4fa]">===</span>
              <span className="text-[#cdd6f4]"> </span>
              <span className="text-[#a6e3a1]">true</span>
              <span className="text-[#cdd6f4]">) </span>
              <span className="text-[#6c7086]">{"{"}</span>
            </h2>
            <p className="mb-6 sm:mb-8 text-sm sm:text-base md:text-lg text-[#9399b2]">
              {
                "/* Code with others — because debugging alone is too depressing */"
              }
              <br />
              {"/*…and breaking stuff in perfect sync. */"}
            </p>
            <div className="flex flex-row gap-3 sm:gap-4 justify-center">
              <Button
                onClick={() => {
                  const roomSection = document.getElementById("room");
                  if (roomSection) {
                    roomSection.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                size="sm"
                className="bg-gradient-to-r from-[#a6e3a1] to-[#89b4fa] hover:from-[#94e2d5] hover:to-[#74c7ec] text-[#1e1e2e] font-semibold text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-2 md:py-3"
              >
                <Terminal className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {"startCoding()"}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  window.open(
                    "https://github.com/Mahir-o4/GoonShareAI",
                    "_blank"
                  );
                }}
                variant="outline"
                className="border-[#45475a] text-[#9399b2] hover:bg-[#313244] bg-transparent text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 sm:py-2 md:py-3"
              >
                <Github className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {"github.clone()"}
              </Button>
            </div>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-[#6c7086]">
              {
                "/* Free forever • We don’t want your card • Open source, so blame is shared */"
              }
            </p>
            <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-[#6c7086]">
              {"}"}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#313244] relative py-3 sm:py-4 bg-gradient-to-br from-[#1e1e2e]/80 to-[#313244]/60 bg-transparent z-10">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-20 space-y-4">
          {/* App Name on top */}
          <div className="flex items-center justify-center sm:justify-start">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#a6e3a1] to-[#89b4fa]">
                <Code2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#1e1e2e]" />
              </div>
              <span className="text-base sm:text-lg font-bold text-[#a6e3a1]">
                {"<OuRAcoDE/>"}
              </span>
            </div>
          </div>

          {/* Main content */}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {/* Left Side */}
            <div className="flex flex-col items-center sm:items-start">
              <p className="text-[#9399b2] mb-2 sm:mb-3 text-xs sm:text-sm text-center sm:text-left">
                {"/* Where bugs are features, and features are bugs. */"}
                <br />
                {"/* The platform nobody asked for, but here we are. */"}
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                <a
                  href="https://github.com/yourusername/GoonShareAI"
                  className="text-[#9399b2] hover:text-[#cdd6f4] transition-colors"
                >
                  <Github className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a
                  href="#"
                  className="text-[#9399b2] hover:text-[#cdd6f4] transition-colors"
                >
                  <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
                <a
                  href="#"
                  className="text-[#9399b2] hover:text-[#cdd6f4] transition-colors"
                >
                  <Discord className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </div>
            </div>

            {/* Right Side - Sarcasm */}
            <div className="flex flex-col items-center sm:items-end text-xs sm:text-sm text-[#9399b2] space-y-1">
              <p>
                {"/* Warning: May cause merge conflicts and mild despair. */"}
              </p>
              <p>{"/* Optimized for chaos, not performance. */"}</p>
              <p>
                {"/* 99% debugging, 1% pretending we know what we’re doing. */"}
              </p>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="border-t border-[#313244] pt-3 mt-2 text-center text-[#6c7086] text-xs sm:text-sm">
            <p>
              {"/* © "}
              {new Date().getFullYear()}
              {
                " OuraCode. Built with questionable life choices, infinite coffee, and 3 AM debugging. Proudly held together with duct tape, console.logs, and sleep deprivation. By Mahir and Sanjoy. */"
              }
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
