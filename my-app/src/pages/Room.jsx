import React, { useState, useEffect, useRef } from 'react';

import CodeEditor from '../components/CodeEditor';

import EnhancedMarkdown from '../components/MarkdownRenderer';

import PromptTemplate from '../components/PromptTemplate';

import { CopyIcon, SendIcon, SparklesIcon, CloseIcon, EnhanceIcon, LoadingIcon } from '../components/Icons';

import MarkdownRenderer from '../components/MarkdownRenderer';



export default function Room() {

  const [code, setCode] = useState('');

  const [language, setLanguage] = useState('');

  const [review, setReview] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(null);

  const [copySuccess, setCopySuccess] = useState('');

  const [chatHistory, setChatHistory] = useState([]);

  const [chatInput, setChatInput] = useState('');

  const [isChatLoading, setIsChatLoading] = useState(false);

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [panelWidth, setPanelWidth] = useState(600);

  const chatContainerRef = useRef(null);

  const isResizing = useRef(false);



  useEffect(() => {

    if (chatContainerRef.current) {

      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;

    }

  }, [chatHistory, isChatLoading]);



  const handleMouseDown = (e) => {

    e.preventDefault();

    isResizing.current = true;

    document.addEventListener('mousemove', handleMouseMove);

    document.addEventListener('mouseup', handleMouseUp);

  };



  const handleMouseMove = (e) => {

    if (!isResizing.current) return;

    const newWidth = window.innerWidth - e.clientX;

    if (newWidth > 400 && newWidth < window.innerWidth * 0.8) {

      setPanelWidth(newWidth);

    }

  };



  const handleMouseUp = () => {

    isResizing.current = false;

    document.removeEventListener('mousemove', handleMouseMove);

    document.removeEventListener('mouseup', handleMouseUp);

  };



  const languages = [

    { value: 'javascript', label: 'JavaScript' }, { value: 'python', label: 'Python' },

    { value: 'java', label: 'Java' }, { value: 'csharp', label: 'C#' },

    { value: 'cpp', label: 'C++' }, { value: 'ruby', label: 'Ruby' },

    { value: 'go', label: 'Go' }, { value: 'html', label: 'HTML' }, { value: 'css', label: 'CSS' },

  ];



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



  const callGeminiAPI = async (prompt) => {

    const apiKey = import.meta.env.VITE_GENAI_API_KEY;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });



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

    setReview('');

    if (!isPanelOpen) setIsPanelOpen(true);



    const prompt = PromptTemplate.getReviewPrompt(language, code);



    try {

      const resultText = await callGeminiAPI(prompt);

      setReview(resultText);

    } catch (err) {

      console.error(err);

      setError(err.message);

    } finally {

      setIsLoading(false);

    }

  };



  const handleChatSubmit = async (e) => {

    e.preventDefault();

    if (!chatInput.trim() || isChatLoading) return;



    const newUserMessage = { role: 'user', text: chatInput };

    const updatedChatHistory = [...chatHistory, newUserMessage];

    setChatHistory(updatedChatHistory);

    setIsChatLoading(true);

    setChatInput('');



    const prompt = PromptTemplate.getChatPrompt({ language, code, review, chatHistory: updatedChatHistory, chatInput });



    try {

      const resultText = await callGeminiAPI(prompt);

      const aiResponse = { role: 'ai', text: resultText };

      setChatHistory(prev => [...prev, aiResponse]);

    } catch (err) {

      const errorResponse = { role: 'ai', text: `Sorry, I encountered an error: ${err.message}` };

      setChatHistory(prev => [...prev, errorResponse]);

    } finally {

      setIsChatLoading(false);

    }

  };



  return (

    <div className="bg-slate-900 h-screen font-sans text-white p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#11111b] via-[#181825] to-[#1e1e2e] flex flex-col overflow-hidden">

      <header className="mb-10 text-center flex-shrink-0">

        <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">

          GoonShareAI

        </h1>

        <p className="text-slate-400 mt-3 font-playwrite">

          Generate, review, and chat about code with Goonology </p>

      </header>



      <main className="flex-grow flex min-h-0">

        <div className="flex-grow flex flex-col bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl">

          <div className="flex justify-between items-center p-4 border-b border-slate-700/50 flex-shrink-0">

            <h2 className="text-xl font-semibold text-slate-200 font-playwrite">Code Editor</h2>

            <div className="flex items-center gap-4">

              <button onClick={handleCopyToClipboard} className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2 disabled:opacity-50" disabled={!code}>

                {copySuccess ? <span className="text-sm text-green-400">{copySuccess}</span> : <><CopyIcon className="w-5 h-5" /> <span className="text-sm">Copy</span></>}

              </button>

              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-slate-700/80 border border-slate-600 rounded-md px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">

                <option value="" disabled>Select Language</option>

                {languages.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}

              </select>

              <button onClick={handleReview} disabled={isLoading} className="flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded-md transition-all duration-300 shadow-lg hover:shadow-indigo-500/50">

                {isLoading ? <LoadingIcon /> : (

                  <EnhanceIcon className="w-5 h-5" />

                )}

                <span>GoonMore</span>

              </button>

            </div>

          </div>

          <div className="flex-grow min-h-0">

            <CodeEditor code={code} setCode={setCode} />

          </div>

        </div>



        {!isPanelOpen && (

          <button onClick={() => setIsPanelOpen(true)} className="flex space-x-1.5 fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 z-20" aria-label="Open AI Panel">

            <span><SparklesIcon /></span> <span>Goonology AI</span>

          </button>

        )}



        {isPanelOpen && (

          <>

            <div

              onMouseDown={handleMouseDown}

              className="w-2 cursor-col-resize bg-slate-700/50 hover:bg-indigo-500 transition-colors duration-200 flex-shrink-0"

            ></div>

            <div style={{ width: panelWidth }} className="bg-slate-800/80 backdrop-blur-xl border-l border-slate-700 shadow-2xl flex flex-col rounded-r-xl flex-shrink-0 h-full">

              <div className="p-4 border-b border-slate-700/50 flex justify-between items-center flex-shrink-0">

                <h2 className="text-xl font-semibold text-slate-200">Goonology AI</h2>

                <button onClick={() => setIsPanelOpen(false)} className="text-slate-400 hover:text-white">

                  <CloseIcon />

                </button>

              </div>

              <div className="p-6 flex-grow overflow-y-auto" ref={chatContainerRef}>

                {isLoading && <div className="flex justify-center items-center h-full"><p className="text-slate-400 animate-pulse">Generating feedback...</p></div>}

                {error && <div className="bg-red-900/50 text-red-300 p-4 rounded-md"><p className="font-bold">An error occurred:</p><p className="mt-1 text-sm">{error}</p></div>}



                {!isLoading && !error && !review && chatHistory.length === 0 && (

                  <div className="flex justify-center items-center h-full text-center"><p className="text-slate-500">Analyze your code or start a conversation.</p></div>

                )}



                {review && <EnhancedMarkdown text={review} onUseCode={(newCode) => setCode(newCode)} />}



                {chatHistory.length > 0 && <hr className="my-6 border-slate-700" />}



                {chatHistory.map((msg, index) => (

                  <div key={index} className={`my-4 p-4 rounded-lg w-fit ${msg.role === 'user' ? 'bg-slate-700/50 ml-auto' : 'bg-slate-800'}`} style={{ maxWidth: '90%' }}>

                    <p className="font-bold text-sm mb-2">{msg.role === 'user' ? 'You' : 'GoonologyAI'}</p>

                    <MarkdownRenderer text={msg.text} onUseCode={(newCode) => setCode(newCode)} />

                  </div>

                ))}

                {isChatLoading && <div className="text-center text-slate-400 animate-pulse">AI is thinking...</div>}

              </div>

              <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-700/50 flex items-center gap-4 flex-shrink-0">

                <input

                  type="text"

                  value={chatInput}

                  onChange={(e) => setChatInput(e.target.value)}

                  placeholder="Ask a follow-up question..."

                  className="flex-grow bg-slate-700/80 border border-slate-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"

                  disabled={isChatLoading}

                />

                <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition-colors">

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