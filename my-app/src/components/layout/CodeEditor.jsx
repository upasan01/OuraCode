import React, { forwardRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { CopyIcon, EnhanceIcon, LoadingIcon } from '../ui/Icons';


const CodeEditor = forwardRef(({
  code,
  setCode,
  language,
  onLanguageChange,
  onCopyToClipboard,
  onReview,
  copySuccess,
  isLoading,
  languages = [],
  width = '100%'
}, ref) => {
  return (
    <div
      ref={ref}
      className="flex-grow flex flex-col bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-10"
      style={{ width }}
    >
      <div className="flex justify-between items-center p-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-slate-200">Code Editor</h2>
        <div className="flex items-center gap-4">
          <button onClick={onCopyToClipboard} className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2 disabled:opacity-50" disabled={!code}>
            {copySuccess ? <span className="text-sm text-green-400">{copySuccess}</span> : <><CopyIcon className="w-5 h-5" /> <span className="text-sm">Copy</span></>}
          </button>
          <select value={language} onChange={(e) => onLanguageChange(e.target.value)} className="bg-slate-700/80 border border-slate-600 rounded-md px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="" disabled>Select Language</option>
            {languages.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
          </select>
          <button onClick={onReview} disabled={isLoading} className="flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded-md transition-all duration-300 shadow-lg hover:shadow-indigo-500/50">
            {isLoading ? <LoadingIcon /> : <EnhanceIcon className="w-5 h-5" />}
            <span>Goon More</span>
          </button>
        </div>
      </div>
      {/* Code Editor */}
      <div className="flex-grow min-h-0 px-2">
        <MonacoEditor
          width="100%"
          height="100%"
          value={code}
          language={language}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: 'Fira Mono, Menlo, Monaco, Consolas, monospace',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            tabSize: 2,
            renderLineHighlight: 'all',
            lineNumbers: 'on',
            formatOnType: true,
            formatOnPaste: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            contextmenu: true,
            folding: true,
          }}
        />
      </div>
    </div>
  );
});

export default CodeEditor;
