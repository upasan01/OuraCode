import React, { useState } from 'react'
import { Menu, X, FileText, Zap, Users, Settings, Code2, Terminal } from "lucide-react"
import { Button } from "../ui/button"

const Nav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full">
      <div className="w-full  mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#a6e3a1] to-[#89b4fa]">
            <Code2 className="h-6 w-6 text-[#1e1e2e]" />
          </div>
          <div>
            <span className="text-2xl font-bold text-[#a6e3a1]">{"<GoonShareAI/>"}</span>
            <div className="text-xs text-[#6c7086]">{"// v2.1.0-stable"}</div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="mt-10 p-[2px] rounded-[90px] bg-gradient-to-r from-white/10 via-white/5 to-white/10">
          <nav className="hidden md:flex items-center space-x-8 rounded-[90px] border-b border-[#313244] bg-[#1e1e2e]/50 backdrop-blur supports-[backdrop-filter]:bg-[#1e1e2e]/60 p-6 font-bold">



            <a
              href="#features"
              className="text-sm text-[#9399b2] hover:text-[#a6e3a1] transition-colors font-mono flex items-center space-x-1"
            >
              <Zap className="h-4 w-4" />
              <span>{"features()"}</span>
            </a>
            <a
              href="#docs"
              className="text-sm text-[#9399b2] hover:text-[#89b4fa] transition-colors font-mono flex items-center space-x-1"
            >
              <FileText className="h-4 w-4" />
              <span>{"docs.read()"}</span>
            </a>
            <a
              href="#api"
              className="text-sm text-[#9399b2] hover:text-[#fab387] transition-colors font-mono flex items-center space-x-1"
            >
              <Terminal className="h-4 w-4" />
              <span>{"api.reference()"}</span>
            </a>
            <a
              href="#community"
              className="text-sm text-[#9399b2] hover:text-[#cba6f7] transition-colors font-mono flex items-center space-x-1"
            >
              <Users className="h-4 w-4" />
              <span>{"community.join()"}</span>
            </a>
            <a
              href="#pricing"
              className="text-sm text-[#9399b2] hover:text-[#f9e2af] transition-colors font-mono flex items-center space-x-1"
            >
              <Settings className="h-4 w-4" />
              <span>{"pricing.view()"}</span>
            </a>
          </nav>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" className="text-[#9399b2] hover:text-[#cdd6f4] hover:bg-[#313244] font-mono">
            {"auth.signIn()"}
          </Button>
          <Button className="bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#1e1e2e] font-semibold font-mono">
            {"deploy.now()"}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[#9399b2] hover:text-[#cdd6f4] hover:bg-[#313244] rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#313244] bg-[#1e1e2e]/95 backdrop-blur">
          <div className="container px-4 py-4 space-y-4">
            <a
              href="#features"
              className="flex items-center space-x-3 text-sm text-[#9399b2] hover:text-[#a6e3a1] transition-colors font-mono py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Zap className="h-4 w-4" />
              <span>{"features()"}</span>
            </a>
            <a
              href="#docs"
              className="flex items-center space-x-3 text-sm text-[#9399b2] hover:text-[#89b4fa] transition-colors font-mono py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FileText className="h-4 w-4" />
              <span>{"docs.read()"}</span>
            </a>
            <a
              href="#api"
              className="flex items-center space-x-3 text-sm text-[#9399b2] hover:text-[#fab387] transition-colors font-mono py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Terminal className="h-4 w-4" />
              <span>{"api.reference()"}</span>
            </a>
            <a
              href="#community"
              className="flex items-center space-x-3 text-sm text-[#9399b2] hover:text-[#cba6f7] transition-colors font-mono py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users className="h-4 w-4" />
              <span>{"community.join()"}</span>
            </a>
            <a
              href="#pricing"
              className="flex items-center space-x-3 text-sm text-[#9399b2] hover:text-[#f9e2af] transition-colors font-mono py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings className="h-4 w-4" />
              <span>{"pricing.view()"}</span>
            </a>

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-[#313244] space-y-3">
              <Button
                variant="ghost"
                className="w-full text-[#9399b2] hover:text-[#cdd6f4] hover:bg-[#313244] font-mono justify-start"
              >
                {"auth.signIn()"}
              </Button>
              <Button className="w-full bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#1e1e2e] font-semibold font-mono">
                {"deploy.now()"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Nav
