import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { CopyIcon, EnhanceIcon, LoadingIcon, DownloadIcon } from '../ui/Icons';
import { downloadCode } from '../../api/controllerApi';

const CodeEditor = forwardRef(({
  code,
  setCode,
  language,
  roomId,
  onLanguageChange,
  onCopyToClipboard,
  onReview,
  copySuccess,
  isLoading,
  languages = [],
  width = '100%'
}, ref) => {
  const editorRef = useRef(null);
  
  // Download states
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const getMonacoLanguage = (lang) => {
    const languageMap = {
      'js': 'javascript',
      'py': 'python', 
      'java': 'java',
      'cs': 'csharp',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
    };
    
    return languageMap[lang] || lang || 'javascript'; 
  };

  // Download handler
  const handleDownload = async () => {
    if (!code || !roomId) {
      setDownloadError('Missing code or room ID');
      return;
    }

    try {
      setDownloadLoading(true);
      setDownloadError('');
      
      // Add timeout to prevent infinite loading
      const downloadPromise = downloadCode(code, roomId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Download timeout - server may be unresponsive')), 30000)
      );
      
      await Promise.race([downloadPromise, timeoutPromise]);
      
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadError(error.message);
    } finally {
      setDownloadLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }
  }));
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

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
          <button 
            onClick={handleDownload} 
            disabled={downloadLoading || !code}
            className="text-slate-400 hover:text-white transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
            title={downloadError || 'Download code'}
          >
            {downloadLoading ? <LoadingIcon className="w-5 h-5" /> : <DownloadIcon className="w-5 h-5" />}
            {downloadError && <span className="text-xs text-red-400">Error</span>}
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
          language={getMonacoLanguage(language)}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            fontSize: 16,
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
