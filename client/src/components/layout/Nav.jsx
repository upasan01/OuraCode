import React, { useState } from 'react';
import { Menu, X, GitPullRequestCreate, Zap, Users, Settings, Code2, Terminal, Github as GithubIcon, House } from "lucide-react";
import { Button } from "../ui/button";

const Nav = ({ onCreateNowClick, onJoinNowClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="relative z-50 w-full px-4 md:px-6 flex justify-between items-center h-20 sm:h-18">
        <div className="flex items-center space-x-3 sm:space-x-3">
          <div className="flex h-12 w-12 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#a6e3a1] to-[#89b4fa]">
            <Code2 className="h-7 w-7 sm:h-6 sm:w-6 text-[#1e1e2e]" />
          </div>
          <div>
            <span className="text-3xl sm:text-2xl font-bold text-[#a6e3a1]">{"<OuRAcoDE/>"}</span>
            <div className="text-sm sm:text-xs text-[#6c7086]">{"// v1.1.0-stable"}</div>
          </div>
        </div>
        <div className="absolute right-0 flex items-center md:px-4">
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost"
              onClick={onCreateNowClick}
              className="text-[#9399b2] hover:text-[#cdd6f4] hover:bg-[#313244] font-mono">
              {"create.room()"}
            </Button>

            <Button
              onClick={() => {
                onJoinNowClick?.();
                // Delay to allow CreateRoom to re-render in join mode
                setTimeout(() => {
                  const roomSection = document.getElementById("room");
                  if (roomSection) {
                    roomSection.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }, 100);
              }}
              className="bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#1e1e2e] font-semibold font-mono">
              {"join.now()"}
            </Button>
          </div>

          <button
            className="md:hidden p-3 sm:p-2 text-[#9399b2] hover:text-[#cdd6f4] hover:bg-[#313244] rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6 sm:h-5 sm:w-5" /> : <Menu className="h-6 w-6 sm:h-5 sm:w-5" />}
          </button>
        </div>
      </div>

      {/* Sticky Navigation Section */}
      <header className="sticky top-2 z-40 w-full px-4 md:px-6">
        <div className="relative w-full flex h-16 items-center justify-center">

          {/* Desktop Navigation */}
          <div className="p-[2px] rounded-[90px] bg-gradient-to-r from-white/10 via-white/5 to-white/10">
            <nav className="hidden md:flex items-center space-x-8 rounded-[90px] border-b border-[#313244] bg-[#1e1e2e]/50 backdrop-blur supports-[backdrop-filter]:bg-[#1e1e2e]/60 px-6 py-4 font-bold">
              <a 
                href="#home" 
                className='text-sm text-[#9399b2] hover:text-[#f9e2af] transition-colors font-mono flex items-center space-x-1'
                onClick={(e) => {
                  e.preventDefault();
                  const homeSection = document.getElementById("home");
                  if (homeSection) {
                    homeSection.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
              >
                <House className="h-4 w-4" />
                <span>{"home()"}</span>
              </a>
              <a
                href="#room"
                className="text-sm text-[#9399b2] hover:text-[#89b4fa] transition-colors font-mono flex items-center space-x-1"
                onClick={(e) => {
                  e.preventDefault();
                  const roomSection = document.getElementById("room");
                  if (roomSection) {
                    roomSection.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
              >
                <GitPullRequestCreate className="h-4 w-4" />
                <span>{"room()"}</span>
              </a>
              <a
                href="#features"
                className="text-sm text-[#9399b2] hover:text-[#a6e3a1] transition-colors font-mono flex items-center space-x-1"
                onClick={(e) => {
                  e.preventDefault();
                  const featuresSection = document.getElementById("features");
                  if (featuresSection) {
                    featuresSection.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
              >
                <Zap className="h-4 w-4" />
                <span>{"features()"}</span>
              </a>
              <a
                href="#api"
                className="text-sm text-[#9399b2] hover:text-[#fab387] transition-colors font-mono flex items-center space-x-1"
                onClick={(e) => {
                  e.preventDefault();
                  window.open("https://github.com/Mahir-o4/OuraCode", "_blank");
                }}
              >
                <GithubIcon className="h-4 w-4" />
                <span>{"git.repo()"}</span>
              </a>
            </nav>
          </div>

        </div>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="flex flex-col h-full bg-[#1e1e2e]/95 backdrop-blur">
                {/* Header with close button */}
                <div className="flex items-center justify-between p-4 border-b border-[#313244]">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#a6e3a1] to-[#89b4fa]">
                      <Code2 className="h-5 w-5 text-[#1e1e2e]" />
                    </div>
                    <span className="text-lg font-bold text-[#a6e3a1]">{"<OuRAcoDE/>"}</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-[#9399b2] hover:text-[#cdd6f4] hover:bg-[#313244] rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Menu Content */}
                <div className="flex-1 px-5 py-6 space-y-4">
                  <a 
                    href="#home" 
                    className='flex items-center space-x-3 text-base text-[#9399b2] hover:text-[#f9e2af] transition-colors font-mono py-3' 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      const homeSection = document.getElementById("home");
                      if (homeSection) {
                        homeSection.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    <House className="h-5 w-5" />
                    <span>{"home()"}</span>
                  </a>
                  <a 
                    href="#room" 
                    className='flex items-center space-x-3 text-base text-[#9399b2] hover:text-[#89b4fa] transition-colors font-mono py-3' 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      const roomSection = document.getElementById("room");
                      if (roomSection) {
                        roomSection.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    <GitPullRequestCreate className="h-5 w-5" />
                    <span>{"room()"}</span>
                  </a>
                  <a
                    href="#features"
                    className="flex items-center space-x-3 text-base text-[#9399b2] hover:text-[#a6e3a1] transition-colors font-mono py-3"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      const featuresSection = document.getElementById("features");
                      if (featuresSection) {
                        featuresSection.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    <Zap className="h-5 w-5" />
                    <span>{"features()"}</span>
                  </a>
                  <a
                    href="#api"
                    className="flex items-center space-x-3 text-base text-[#9399b2] hover:text-[#fab387] transition-colors font-mono py-3"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      window.open("https://github.com/Mahir-o4/OuraCode", "_blank");
                    }}
                  >
                    <GithubIcon className="h-5 w-5" />
                    <span>{"git.repo()"}</span>
                  </a>

                  <div className="pt-4 border-t border-[#313244] space-y-3">
                    <Button
                      onClick={() => {
                        onCreateNowClick?.();
                        setIsMobileMenuOpen(false);
                        setTimeout(() => {
                          const roomSection = document.getElementById("room");
                          if (roomSection) {
                            roomSection.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        }, 100);
                      }}
                      variant="ghost"
                      className="w-full text-[#9399b2] hover:text-[#cdd6f4] hover:bg-[#313244] font-mono justify-start text-base py-3"
                    >
                      {"create.room()"}
                    </Button>
                    <Button
                      onClick={() => {
                        onJoinNowClick?.();
                        setIsMobileMenuOpen(false);
                        // Add delay to allow CreateRoom to re-render in join mode
                        setTimeout(() => {
                          const roomSection = document.getElementById("room");
                          if (roomSection) {
                            roomSection.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        }, 100);
                      }}
                      className="w-full bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#1e1e2e] font-semibold font-mono text-base py-3">
                      {"join.now()"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  )
}

export default Nav;