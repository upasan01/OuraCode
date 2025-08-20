import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';

// A single stylesheet for all dynamic cursor styles
const styleSheetId = 'dynamic-cursor-styles';

function getOrCreateCursorStyleSheet() {
  let styleSheet = document.getElementById(styleSheetId);
  if (!styleSheet) {
    styleSheet = document.createElement('style');
    styleSheet.id = styleSheetId;
    document.head.appendChild(styleSheet);
  }
  return styleSheet.sheet; // Return the CSSStyleSheet object
}

const CodeEditor = forwardRef(({
  code,
  setCode,
  language,
  onEditorMount,
  onCursorChange,
  remoteCursors,
  myUserName
}, ref) => {
  const editorRef = useRef(null);
  const monaco = useMonaco();
  const isApplyingRemoteChange = useRef(false);
  const decorationIdsRef = useRef([]);
  const knownUsers = useRef(new Set());

  useImperativeHandle(ref, () => ({
    applyRemoteUpdate: (newCode) => {
      if (editorRef.current) {
        isApplyingRemoteChange.current = true;
        const viewState = editorRef.current.saveViewState();
        editorRef.current.setValue(newCode);
        if (viewState) {
          editorRef.current.restoreViewState(viewState);
        }
        isApplyingRemoteChange.current = false;
      }
    }
  }));

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
    if (onEditorMount) onEditorMount(editor);
    if (onCursorChange) {
      editor.onDidChangeCursorPosition(event => {
        if (!isApplyingRemoteChange.current) {
          onCursorChange(event.position);
        }
      });
    }
  };

  const handleEditorChange = (value) => {
    if (!isApplyingRemoteChange.current) {
      setCode(value || '');
    }
  };

  useEffect(() => {
    
    if (!editorRef.current || !remoteCursors || !monaco) return;

    const editor = editorRef.current;
    const newDecorations = [];
    const styleSheet = getOrCreateCursorStyleSheet();

    remoteCursors.forEach((cursor, username) => {
      if (username !== myUserName && cursor.position) {
        const { lineNumber, column } = cursor.position;
        const uniqueClassName = `remote-cursor-user-${username.replace(/[^a-zA-Z0-9]/g, '-')}`;
        const uniqueLabelClassName = `remote-cursor-label-user-${username.replace(/[^a-zA-Z0-9]/g, '-')}`;

        if (!knownUsers.current.has(username)) {
          try {
            // Using a border is more reliable than a pseudo-element for height
            styleSheet.insertRule(`.${uniqueClassName} { border-left: 2px solid ${cursor.color}; }`, styleSheet.cssRules.length);
            styleSheet.insertRule(`.${uniqueLabelClassName}::after { background-color: ${cursor.color}; content: '${username}'; }`, styleSheet.cssRules.length);
            knownUsers.current.add(username);
          } catch (e) {
            console.error("Failed to insert CSS rule:", e);
          }
        }

        newDecorations.push({
          range: new monaco.Range(lineNumber, column, lineNumber, column),
          options: {
            className: `remote-cursor ${uniqueClassName}`,
            glyphMarginClassName: `remote-cursor-label ${uniqueLabelClassName}`,
          },
        });
      }
    });

    decorationIdsRef.current = editor.deltaDecorations(
      decorationIdsRef.current,
      newDecorations
    );

  }, [monaco, myUserName, remoteCursors]);


  // This cleanup effect now ONLY handles unmounting
  useEffect(() => {
    return () => {
      // Capture current values in the cleanup, not at effect creation time
      if (editorRef.current && decorationIdsRef.current.length > 0) {
        editorRef.current.deltaDecorations(decorationIdsRef.current, []);
      }
      const styleSheet = document.getElementById(styleSheetId);
      if (styleSheet) {
        styleSheet.remove();
      }
    };
  }, []);

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
            glyphMargin: true,
          }}
        />
      </div>
    </div>
  );
});

export default CodeEditor;