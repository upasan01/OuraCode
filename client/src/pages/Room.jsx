
import React, { useState, useEffect, useRef } from 'react';

import CodeEditor from '../components/layout/CodeEditor';
import MarkdownRenderer from '../components/layout/MarkdownRenderer';
import PromptTemplate from '../components/layout/PromptTemplate';
import { SendIcon, SparklesIcon, CloseIcon } from '../components/ui/Icons';
import AnimatedButton from '../components/ui/AnimatedButton';
import BackgroundGradientAnimation from '../components/ui/BackgroundGradientAnimation';
import { useParams, useLocation } from 'react-router-dom';
import { Code2 } from 'lucide-react';

export default function Room() {

  // Room code from URL param
  const { roomCode, username } = useParams();

  // Get username and language from location state
  const location = useLocation();
  const { language: selectedlanguage } = location.state || {};

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(selectedlanguage);

  //  UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  // Chat state - All messages now go into chatHistory.
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // AI Panel state and sizing
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(600);
  const [isResizingPanel, setIsResizingPanel] = useState(false);

  // Refs for chat scroll and panel resizing
  const chatContainerRef = useRef(null);
  const isResizing = useRef(false);

  // Scroll to bottom of chat when history changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isChatLoading]);

  // Handle drag start on AI panel resizer
  const handleMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;
    setIsResizingPanel(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // ⚙️ Resize AI panel width, within bounds with throttling for smoother performance
  const handleMouseMove = (e) => {
    if (!isResizing.current) return;

    // Throttle the resize for smoother performance
    requestAnimationFrame(() => {
      const maxWidth = window.innerWidth - 200;
      const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, 400), Math.min(900, maxWidth));
      setPanelWidth(newWidth);
    });
  };

  // ⚙️ Stop resizing on mouse release
  const handleMouseUp = () => {
    isResizing.current = false;
    setIsResizingPanel(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Supported language options for dropdown
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
  ];

  // 📋 Copy code to clipboard and show feedback
  const handleCopyToClipboard = () => {
    if (!code) return;
    const textArea = document.createElement("textarea");
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
    }
    document.body.removeChild(textArea);
  };

  // Call Gemini API with a prompt and return result text
  const callGeminiAPI = async (prompt) => {
    const apiKey = import.meta.env.VITE_GENAI_API_KEY
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`API Error: ${response.status} - ${errorBody.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      return result.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response structure from API.");
    }
  };


  const handleReview = async () => {
    if (!code.trim() || !language) {
      setError('Please enter code/task and select a language.');
      if (!isPanelOpen) setIsPanelOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    if (!isPanelOpen) setIsPanelOpen(true);

    const prompt = PromptTemplate.getReviewPrompt(language, code);

    const analysisPlaceholder = { role: 'ai', text: '' };
    setChatHistory(prev => [...prev, analysisPlaceholder]);

    try {
      const resultText = await callGeminiAPI(prompt);
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: resultText };
        return newHistory;
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: `Error: ${err.message}` };
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const newUserMessage = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, newUserMessage, { role: 'ai', text: '' }]);
    setIsChatLoading(true);
    setChatInput('');

    const prompt = PromptTemplate.getChatPrompt({ language, code, chatHistory: [...chatHistory, newUserMessage], chatInput });

    try {
      const resultText = await callGeminiAPI(prompt);
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = { role: 'ai', text: resultText };
        return newHistory;
      });
    } catch (err) {
      const errorResponse = { role: 'ai', text: `Sorry, I encountered an error: ${err.message}` };
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = errorResponse;
        return newHistory;
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  // Main UI structure
  return (
    <div className="relative h-screen font-mono text-white p-2 sm:p-5 flex flex-col overflow-hidden">
      <div className="fixed inset-0 w-full h-full z-0">
        <BackgroundGradientAnimation />
      </div>

      {/* 💡 App title */}
      <div className="flex items-center space-x-3 z-10 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#a6e3a1] to-[#89b4fa]">
          <Code2 className="h-6 w-6 text-[#1e1e2e]" />
        </div>
        <div>
          <span className="text-2xl font-bold text-[#a6e3a1]">{"<GoonShareAI/>"}</span>
          <div className="text-xs text-[#7b7d87]">{"// v1.1.0-stable"}</div>
        </div>
      </div>

      <main className="flex-grow flex min-h-0">
        {/* 📝 Code editor panel */}
        <CodeEditor
          code={code}
          setCode={setCode}
          language={language}
          onLanguageChange={setLanguage}
          onCopyToClipboard={handleCopyToClipboard}
          onReview={handleReview}
          copySuccess={copySuccess}
          isLoading={isLoading}
          languages={languages}
          width={isPanelOpen ? `calc(100% - ${panelWidth}px - 8px)` : '100%'}
        />

        {/* 🧠 Open panel button */}
        {!isPanelOpen && (
          <AnimatedButton
            show={<SparklesIcon />}
            more="GoonologyAI"
            onClick={() => setIsPanelOpen(true)}
            className="fixed bottom-8 right-8"
          />
        )}

        {/* 🧠 AI Panel + resizer */}
        {isPanelOpen && (
          <>
            {/* Resizer line */}
            <div
              onMouseDown={handleMouseDown}
              className="w-2 cursor-col-resize bg-slate-700/50 hover:bg-indigo-500 transition-all duration-500 ease-in-out flex-shrink-0 z-10 animate-fade-in"
            ></div>

            {/* Panel */}
            <div
              style={{ width: panelWidth }}
              className={`bg-slate-800/80 backdrop-blur-xl border-l border-slate-700 shadow-2xl flex flex-col rounded-r-xl flex-shrink-0 h-full z-10 translate-x-0 opacity-100 ${!isResizingPanel ? 'transition-all duration-700 ease-in-out' : ''
                }`}
            >
              <div className="p-4 border-b border-slate-700/50 flex justify-between items-center flex-shrink-0 animate-fade-in-delay-100">
                <h2 className="text-xl font-semibold text-slate-200">Goonology AI</h2>
                <button onClick={() => setIsPanelOpen(false)} className="text-slate-400 hover:text-white"><CloseIcon /></button>
              </div>

              {/* Chat and review output */}
              <div className="p-6 flex-grow overflow-y-auto animate-fade-in-delay-200" ref={chatContainerRef}>
                {error && <div className="bg-red-900/50 text-red-300 p-4 rounded-md"><p className="font-bold">An error occurred:</p><p className="mt-1 text-sm">{error}</p></div>}

                {/* Simplified render logic now only depends on chatHistory */}
                {chatHistory.length === 0 && !isLoading && !error && (
                  <div className="flex justify-center items-center h-full text-center"><p className="text-slate-500">Analyze your code or start a conversation.</p></div>
                )}

                {chatHistory.map((msg, index) => (
                  <div key={index} className={`my-4 p-4 rounded-lg w-fit ${msg.role === 'user' ? 'bg-slate-700/50 ml-auto' : 'bg-slate-800'}`} style={{ maxWidth: '90%' }}>
                    <p className="font-bold text-sm mb-2">{msg.role === 'user' ? 'You' : 'GoonologyAI'}</p>
                    {/* Display loading placeholder or the final message */}
                    {msg.text ? <MarkdownRenderer text={msg.text} onUseCode={(newCode) => setCode(newCode)} /> : <div className="text-center text-slate-400 animate-pulse">Gooner is thinking...</div>}
                  </div>
                ))}
              </div>

              {/* Chat input */}
              <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-700/50 flex items-center gap-4 flex-shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-grow bg-slate-700/80 border border-slate-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isChatLoading || isLoading}
                />
                <button type="submit" disabled={isChatLoading || isLoading || !chatInput.trim()} className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition-colors">
                  <SendIcon />
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
