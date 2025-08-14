import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import MonacoEditor from '@monaco-editor/react';

const CodeEditor = forwardRef(({
  code,
  setCode,
  language,
  onLanguageChange,
}, ref) => {
  const editorRef = useRef(null);

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
      className="flex-grow flex flex-col bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-10 h-full"
    >
      
      {/* Code Editor */}
      <div className="flex-grow px-2">
        <MonacoEditor
          width="100%"
          height="100%"
          value={code}
          language={language || 'javascript'}
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
