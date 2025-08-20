import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

const CodeEditor = forwardRef(({
  code,
  setCode,
  language,
  onEditorMount,
  onCursorChange,
}, ref) => {
  const editorRef = useRef(null);
  const isApplyingRemoteChange = useRef(false);

  useImperativeHandle(ref, () => ({
    applyRemoteUpdate: (newCode) => {
      if (editorRef.current) {
        // Set the flag to true before making a programmatic change
        isApplyingRemoteChange.current = true;

        const viewState = editorRef.current.saveViewState();
        editorRef.current.setValue(newCode);
        if (viewState) {
          editorRef.current.restoreViewState(viewState);
        }

        // Unset the flag after the change is complete
        isApplyingRemoteChange.current = false;
      }
    }
  }));

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.focus();

    if (onEditorMount) {
      onEditorMount(editor);
    }

    if (onCursorChange) {
      console.log("Cursor moved to:", event.position); // should log now
      editor.onDidChangeCursorPosition(event => {
        onCursorChange(event.position);
      });
    }
  };


  const handleEditorChange = (value) => {
    // Only call setCode if the change was made by the local user
    if (!isApplyingRemoteChange.current) {
      setCode(value || '');
    }
  };

  return (
    <div className="flex-grow flex flex-col bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-10 h-full">
      <div className="flex-grow px-2">
        <MonacoEditor
          width="100%"
          height="100%"
          defaultValue={code}
          language={language || 'javascript'}
          onChange={handleEditorChange}
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