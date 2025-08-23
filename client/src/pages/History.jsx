import React, { useState, useEffect, useRef } from "react";
import FaultyTerminal from "../components/ui/FaultyTerminal";

export default function History() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(0.5);
  const [glitchActive, setGlitchActive] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [showBooting, setShowBooting] = useState(true);
  const [animationStarted, setAnimationStarted] = useState(false);

  const textRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGlitchActive(false);
      setShowBooting(false);
      setTimeout(() => {
        setAnimationStarted(true);
        setIsPlaying(true);
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    let soundInterval = null; 

    if (soundOn && showBooting) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        const playBeep = (freq, delay, duration = 0.1) => {
          setTimeout(() => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.type = "square";
            oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            oscillator.start();
            oscillator.stop(ctx.currentTime + duration);
          }, delay);
        };

        // Function that plays the sequence of beeps
        const playBootSound = () => {
          playBeep(800, 0, 0.15);
          playBeep(600, 200, 0.15);
          playBeep(400, 400, 0.15);
          playBeep(1000, 600, 0.3);
        };

        // Play it once immediately, then set it to repeat
        playBootSound();
        soundInterval = setInterval(playBootSound, 1500); //not working for some reason
      } catch (e) {
        console.log("Audio not available");
      }
    }

    // This is the cleanup function
    return () => {
      if (soundInterval) {
        clearInterval(soundInterval); // Stop the repeating sound when conditions change
      }
    };
  }, [soundOn, showBooting]); // This effect re-runs if soundOn or showBooting changes

  // Placeholder history lines - you can replace these
  const historyLines = [
    "⚠️ ATTENTION ⚠️ You've officially booted into THE PAST…",
    "The forbidden chronicles of GoonShareAI (later rebranded to OuRAcoDE, cause why the hell not).",
    "This ain't your regular history. It's the drunk uncle version — loud, messy, and brutally honest.",

    "So one random-ass day, inside a half-dead college lab...",
    "Two sleep-deprived idiots (aka Mahir and Sanjoy) thought:",
    "'Hey, what if we built a half-baked Google Docs clone… but make it open-source.'",
    "OPEN-SOURCE, they said. REVOLUTIONARY, they thought.",
    "Reality check: it was just two broke students trying to dodge actual coursework.",

    "And of course, the first priority wasn't the code. Nah.",
    "It was: WHAT SHOULD WE NAME THIS MONSTROSITY?",
    "After minutes of deep philosophical thought (aka fart jokes and procrastination)…",
    "They proudly screamed: 'GOONSHAREAI!'",
    "Why? No reason. Just vibes. Don't question it.",

    "Sanjoy decided to 'experiment with the backend.'",
    "Which basically meant breaking stuff no one asked to be broken.",
    "Meanwhile Mahir (who DESPISES frontend with his whole soul)…",
    "…got shoved straight into React purgatory. F in chat.",

    "Fast-forward → endless nights of debugging like zombies.",
    "Every fix spawned two new bugs. Hydra-level coding hell.",
    "Imagine staring at VS Code at 3 AM whispering:",
    "'Please… just work this one time, you bastard.'",

    "Commit messages? Absolute chaos.",
    "'final_final_REAL_fix.js'",
    "'ok_now_it_should_work_fuck.js'",
    "'idk_man_leave_me_alone.js'",
    "Pure GitHub archeology at this point.",

    "Oh, and the timeline? LMAO.",
    "'We'll finish this in one week!'",
    "Reality: project lasted longer than some relationships.",

    "The repo? A crime scene.",
    "Half-finished features duct-taped together.",
    "Readme full of lies. Issues tab crying for help.",
    "And the CI/CD? More like See-It/Crash-Die.",

    "At one point, the app was so buggy we considered EXORCISM.",
    "Frontend randomly exploding. Backend gaslighting us.",
    "The database looking like it was possessed by Satan's JSON parser.",

    "And yet, here we are.",
    "Still scrolling on this ugly green terminal vibe like it's a retro hacker movie.",
    "Because this wasn't just an app. It was WAR.",
    "Us vs Bugs. Us vs Sleep. Us vs Life Choices.",

    "We learned valuable lessons though.",
    "Lesson 1: College lectures > debugging spaghetti React code.",
    "Lesson 2: Never trust deadlines made by overconfident idiots.",
    "Lesson 3: Caffeine is a performance enhancer AND a slow poison.",

    "Somewhere down the line, repo got too vulgar to stay public.",
    "So we slapped a shiny new name on it: OuRAcoDE.",
    "Because if you can't fix your code, just rebrand the damn thing.",

    "Why Aura? Cause apparently you gotta VIBE when you code.",
    "Not 'build,' not 'ship,' not 'deploy'… just VIBE.",
    "So yeah, code with infinite aura™. Whatever that means.",

    "Pro tip: type 'goon' in the terminal for some spicy, unholy motivation.",
    "Spoiler: it won't fix your bugs, but it'll roast your life choices.",

    "At the end of the day, GoonShareAI wasn't just a project.",
    "It was a survival story. A cautionary tale. A shitshow with documentation.",
    "And YOU, unlucky soul, now get to witness it scroll past your eyes.",

    "So raise a PR if you're feeling brave.",
    "Or fork it and make your own disaster repo. Misery loves company.",
    "Either way, welcome to the cult of chaos coding.",

    "That's it. History lesson over.",
    "No post-credit scenes. This ain't Marvel.",
    "Go home, coder. Touch grass. Or at least, restart your damn router.",
    "",
    "",
    "OuRAcoDE",
  ];

  const handlePlayPause = () => {
    if (animationStarted) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSpeedDecrease = () => {
    setScrollSpeed((s) => Math.max(0.25, s - 0.25));
  };

  const handleSpeedIncrease = () => {
    setScrollSpeed((s) => Math.min(4, s + 0.25));
  };

  const handleSoundToggle = () => {
    setSoundOn(!soundOn);
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="fixed inset-0 ">
        <div
          style={{
            width: "100%",
            height: "600px",
            position: "relative",
            filter:
              "drop-shadow(0 0 60px #00ff77aa) brightness(1.05) saturate(1.2)",
            background: "rgba(0,255,119,0.08)",
            mixBlendMode: "screen",
          }}
        >
          <FaultyTerminal
            scale={1.5}
            gridMul={[2, 1]}
            digitSize={1.2}
            timeScale={1}
            pause={false}
            scanlineIntensity={1}
            glitchAmount={1}
            flickerAmount={1}
            noiseAmp={1}
            chromaticAberration={0}
            dither={0}
            curvature={0.25}
            tint="#00ff77"
            mouseReact={true}
            mouseStrength={0.5}
            pageLoadAnimation={false}
            brightness={1}
          />
        </div>
      </div>
      {/* Multiple Glitch Overlays */}
      {glitchActive && (
        <>
          <div
            className="absolute inset-0 bg-green-400 z-40"
            style={{
              pointerEvents: "none",
              opacity: 0,
              animation: "glitchFlash1 0.1s linear infinite",
            }}
          />

          <div
            className="absolute inset-0 bg-red-500 z-41"
            style={{
              pointerEvents: "none",
              opacity: 0,
              animation: "glitchFlash2 0.15s linear infinite 0.05s",
            }}
          />

          <div
            className="absolute inset-0 bg-blue-500 z-42"
            style={{
              pointerEvents: "none",
              opacity: 0,
              animation: "glitchFlash3 0.2s linear infinite 0.1s",
            }}
          />

          <div
            className="absolute inset-0 z-43"
            style={{
              pointerEvents: "none",
              background: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                rgba(0,255,119,0.1) 2px,
                rgba(0,255,119,0.1) 4px
              )`,
              animation: "scanlines 0.1s linear infinite",
            }}
          />
        </>
      )}
      {/* Booting text overlay */}
      {showBooting && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-50 text-green-400 font-mono space-y-4"
          style={{ pointerEvents: "none" }}
        >
          <div className="text-base sm:text-3xl animate-pulse px-3 text-center">
            BOOTING OURACŌDE TERMINAL v2.1
          </div>
          <div className="text-xs sm:text-xl px-3 text-center">
            ▁▂▃▄▅▆▇█ LOADING HISTORY MODULE █▇▆▅▄▃▂▁
          </div>
          <div className="text-xs sm:text-sm animate-bounce mt-2 sm:mt-4 px-3 text-center">
            INITIALIZING THE GOON HISTORY
          </div>
        </div>
      )}
      {/* TV Frame */}
      <div
        className="z-20 relative w-full max-w-xs sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] aspect-[4/3] border-4 sm:border-8 border-gray-700 rounded-2xl sm:rounded-3xl shadow-2xl bg-gradient-to-b from-gray-800 to-black flex flex-col items-center justify-center px-2 sm:px-0 py-2 sm:py-0"
        style={{
          boxShadow: "0 0 40px #00ff7766",
          borderColor: "#00ff77",
        }}
      >
        {/* Screen */}
        <div
          className="w-[95%] h-[50vh] sm:h-[85%] bg-black rounded-xl overflow-hidden relative border-2 border-gray-600 z-10"
          style={{
            boxShadow: "inset 0 0 20px #00ff7766",
            background:
              "linear-gradient(180deg, rgba(0,255,119,0.08) 0%, rgba(0,0,0,1) 100%)", 
          }}
        >
          {/*Scrolling text */}
          {animationStarted && (
            <div className="absolute inset-0 flex items-end justify-center">
              <div
                ref={textRef}
                className="text-green-400 font-mono text-xs sm:text-base md:text-base leading-relaxed text-center px-3 sm:px-4"
                style={{
                  animation: isPlaying
                    ? `movieCredits ${120 / scrollSpeed}s linear infinite`
                    : `movieCredits ${
                        120 / scrollSpeed
                      }s linear infinite paused`,
                  whiteSpace: "pre-line",
                  textShadow: "0 0 8px #00ff77, 0 0 2px #00ff77", // green glow
                }}
              >
                {historyLines.map((line, idx) => (
                  <div key={idx} className="mb-2 sm:mb-4 text-xs sm:text-base md:text-base break-words">
                    {line}
                    {idx === historyLines.length - 1 && (
                      <span className="inline-block w-2 bg-green-400 animate-pulse ml-1">
                        █
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
  <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2 sm:mt-4 px-2 sm:px-4">
          <button
            onClick={handlePlayPause}
            disabled={!animationStarted}
            className={`font-bold px-2 py-1 sm:px-4 sm:py-2 rounded-md sm:rounded-lg shadow-lg transition-all duration-200 text-xs sm:text-base ${
              animationStarted
                ? "bg-green-400 text-black hover:bg-green-300 hover:scale-105"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>

          <button
            onClick={handleSpeedDecrease}
            disabled={!animationStarted}
            className={`font-bold px-2 py-1 sm:px-4 sm:py-2 rounded-md sm:rounded-lg shadow-lg transition-all duration-200 text-xs sm:text-base ${
              animationStarted
                ? "bg-green-400 text-black hover:bg-green-300 hover:scale-105"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            🐌 Slower
          </button>

          <div
            className={`font-bold px-2 py-1 sm:px-3 sm:py-2 rounded-md sm:rounded-lg shadow-lg flex items-center text-xs sm:text-base ${
              animationStarted
                ? "bg-green-400 text-black"
                : "bg-gray-600 text-gray-400"
            }`}
          >
            Speed: {scrollSpeed.toFixed(2)}x
          </div>

          <button
            onClick={handleSpeedIncrease}
            disabled={!animationStarted}
            className={`font-bold px-2 py-1 sm:px-4 sm:py-2 rounded-md sm:rounded-lg shadow-lg transition-all duration-200 text-xs sm:text-base ${
              animationStarted
                ? "bg-green-400 text-black hover:bg-green-300 hover:scale-105"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            🐰 Faster
          </button>

          <button
            onClick={handleSoundToggle}
            className="bg-green-400 text-black font-bold px-2 py-1 sm:px-4 sm:py-2 rounded-md sm:rounded-lg shadow-lg hover:bg-green-300 hover:scale-105 transition-all duration-200 text-xs sm:text-base"
          >
            {soundOn ? "🔊 Sound" : "🔇 Muted"}
          </button>
        </div>
      </div>
    </div>
  );
}
