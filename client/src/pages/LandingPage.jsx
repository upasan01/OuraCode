import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Particles from "../components/ui/particles";
import Nav from "../components/layout/Nav";
import { Code2, Share2, Terminal, GitBranch, Play, MessageSquare, Eye, DiscIcon as Discord, Github, Twitter } from "lucide-react";
import CreateRoom from "../components/layout/CreateRoom";
import TextType from "../components/ui/TextType";

export default function GoonShareAILanding() {

  return (
    <main id="home" className="relative min-h-screen w-full bg-gradient-to-br from-[#11111b] via-[#181825] to-[#1e1e2e] font-mono">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full z-10">
        <Particles />
      </div>
      <Nav />
      {/* Hero Section */}
      <section className="relative overflow-hidden md:py-10 z-0">
        <div className="absolute inset-0"></div>

        <div className="w-full max-w-7xl mx-auto relative px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-[#313260]/50 text-[#a6e3a1] border-[#313244] hover:bg-[#313244]/70 mt-6">
              <Terminal className="w-4 h-4 mr-1" />
              {"/* real-time vibe coding */"}
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
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
              <span className="bg-gradient-to-r from-[#a6e3a1] via-[#89b4fa] to-[#cba6f7] bg-clip-text text-transparent">vibe_gooner</span>
              <span className="text-[#89b4fa]">)</span>
              <div className="text-[#6c7086]"> {"{"}</div>
            </h1>

            <p className="mx-auto mb-12 max-w-2xl text-xs sm:text-lg text-[#9399b2] leading-relaxed">
              <span className="text-[#6c7086]">{"/**"}</span>
              <br />
              <span className="text-[#6c7086]">{" * Real-time code sharing with live cursors,"}</span>
              <br />
              <span className="text-[#6c7086]">{" * AI chat, and instant execution."}</span>
              <br />
              <span className="text-[#6c7086]">{" * @param {Object} session - Build together, debug faster"}</span>
              <br />
              <span className="text-[#6c7086]">{" * @returns {Promise<Success>} - Learn continuously and Vibe together"}</span>
              <br />
              <span className="text-[#6c7086]">{" */"}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Room Creation/Join Section */}
      <section id="room" className="relative z-20 sm:py-25">
        <CreateRoom />
      </section>

      {/* Features Cards */}
      <section id="features" className="py-20 md:py-32 relative">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-20">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl text-[#a6e3a1]">
              {"/* Core Features */"}
            </h2>
            <p className="text-lg text-[#9399b2]">
              {"// Everything you need for seamless collaborative coding"}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-[#313244]/50 border-[#45475a] hover:border-[#a6e3a1]/50 transition-all duration-300 group">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#a6e3a1]/20 group-hover:bg-[#a6e3a1]/30 transition-colors">
                  <Code2 className="h-6 w-6 text-[#a6e3a1]" />
                </div>
                <CardTitle className="text-[#a6e3a1]">realtime.sync()</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#9399b2]">
                  {
                    "/* Live cursors, instant sync, and real-time code editing. See exactly what your teammates are working on. */"
                  }
                </p>
                <div className="mt-3 text-xs text-[#6c7086]">{"websocket.connect()"}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#313244]/50 border-[#45475a] hover:border-[#89b4fa]/50 transition-all duration-300 group">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#89b4fa]/20 group-hover:bg-[#89b4fa]/30 transition-colors">
                  <Play className="h-6 w-6 text-[#89b4fa]" />
                </div>
                <CardTitle className="text-[#89b4fa]">execute.instantly()</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#9399b2]">
                  {
                    "/* Run code instantly in the browser. Support for 10+ languages with built-in compiler and runtime. */"
                  }
                </p>
                <div className="mt-3 text-xs text-[#6c7086]">{"runtime.exec(code)"}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#313244]/50 border-[#45475a] hover:border-[#cba6f7]/50 transition-all duration-300 group">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#cba6f7]/20 group-hover:bg-[#cba6f7]/30 transition-colors">
                  <MessageSquare className="h-6 w-6 text-[#cba6f7]" />
                </div>
                <CardTitle className="text-[#cba6f7]">chat.connect()</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#9399b2]">
                  {
                    "/* Built-in voice chat and text messaging. Discuss code, share ideas, and debug together seamlessly. */"
                  }
                </p>
                <div className="mt-3 text-xs text-[#6c7086]">{"voice.enable(true)"}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#313244]/50 border-[#45475a] hover:border-[#fab387]/50 transition-all duration-300 group">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#fab387]/20 group-hover:bg-[#fab387]/30 transition-colors">
                  <Share2 className="h-6 w-6 text-[#fab387]" />
                </div>
                <CardTitle className="text-[#fab387]">share.export()</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#9399b2]">
                  {"/* Share your code with a simple link. Export to GitHub, save as gists, or download as files. */"}
                </p>
                <div className="mt-3 text-xs text-[#6c7086]">{"github.push(repo)"}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#313244]/50 border-[#45475a] hover:border-[#94e2d5]/50 transition-all duration-300 group">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#94e2d5]/20 group-hover:bg-[#94e2d5]/30 transition-colors">
                  <GitBranch className="h-6 w-6 text-[#94e2d5]" />
                </div>
                <CardTitle className="text-[#94e2d5]">git.version()</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#9399b2]">
                  {"/* Built-in version history, branching, and merge capabilities. Never lose your progress again. */"}
                </p>
                <div className="mt-3 text-xs text-[#6c7086]">{"git.commit('feat')"}</div>
              </CardContent>
            </Card>

            <Card className="bg-[#313244]/50 border-[#45475a] hover:border-[#f9e2af]/50 transition-all duration-300 group">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f9e2af]/20 group-hover:bg-[#f9e2af]/30 transition-colors">
                  <Eye className="h-6 w-6 text-[#f9e2af]" />
                </div>
                <CardTitle className="text-[#f9e2af]">preview.live()</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#9399b2]">
                  {
                    "/* See your web applications come to life with instant preview. Hot reload for faster development. */"
                  }
                </p>
                <div className="mt-3 text-xs text-[#6c7086]">{"hotReload.enable()"}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Room-less Join Section */}
      <section className="py-20 md:py-32 border-t border-[#313244] relative">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
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
            <p className="mb-8 text-lg text-[#9399b2]">
              {"/* Join thousands of developers who are already collaborating */"}
              <br />
              {"/* and building amazing projects together. */"}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#a6e3a1] to-[#89b4fa] hover:from-[#94e2d5] hover:to-[#74c7ec] text-[#1e1e2e] font-semibold"
              >
                <Terminal className="mr-2 h-4 w-4" />
                {"startCoding()"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#45475a] text-[#9399b2] hover:bg-[#313244] bg-transparent"
              >
                <Github className="mr-2 h-4 w-4" />
                {"github.clone()"}
              </Button>
            </div>
            <p className="mt-4 text-sm text-[#6c7086] ">
              {"/* Free forever • No credit card required • Open source */"}
            </p>
            <div className="mt-4 text-sm text-[#6c7086]">{"}"}</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#313244] relative py-6">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative z-20">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#a6e3a1] to-[#89b4fa]">
                  <Code2 className="h-5 w-5 text-[#1e1e2e]" />
                </div>
                <span className="text-lg font-bold text-[#a6e3a1]">{"<GoonShareAI/>"}</span>
              </div>
              <p className="text-[#9399b2] mb-4 text-sm">
                {"/* The ultimate collaborative coding platform */"}
                <br />
                {"/* for developers who build together. */"}
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-[#9399b2] hover:text-[#cdd6f4] transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-[#9399b2] hover:text-[#cdd6f4] transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-[#9399b2] hover:text-[#cdd6f4] transition-colors">
                  <Discord className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div className="border-t border-[#313244] mt-8 pt-8 text-center text-[#6c7086] text-sm">
              <p>
                {"/* © "}
                {new Date().getFullYear()}
                {" GoonShareAI. Built with ❤️ by developers, for developers. Come Goon With Sanjoy*/"}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
