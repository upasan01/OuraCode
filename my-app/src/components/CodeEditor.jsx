import React, { useState, useEffect, useRef } from 'react';



const CodeEditor = ({ code, setCode }) => {

  const [lineCount, setLineCount] = useState(1);

  const lineCounterRef = useRef(null);

  const textareaRef = useRef(null);



  useEffect(() => {

    const lines = code.split('\n').length;

    setLineCount(lines);

  }, [code]);



  const handleScroll = () => {

    if (lineCounterRef.current && textareaRef.current) {

      lineCounterRef.current.scrollTop = textareaRef.current.scrollTop;

    }

  };



  return (

    <div className="flex-grow p-1 flex bg-slate-900/80 rounded-xl overflow-hidden h-full">

      <div ref={lineCounterRef} className="line-numbers text-right pr-4 pt-4 text-slate-500 font-mono text-sm select-none overflow-y-hidden">

        {Array.from({ length: lineCount }, (_, i) => i + 1).map(num => <div key={num}>{num}</div>)}

      </div>

      <textarea

        ref={textareaRef}

        value={code}

        onChange={(e) => setCode(e.target.value)}

        onScroll={handleScroll}

        className="w-full h-full bg-transparent text-slate-200 p-4 resize-none font-mono text-sm leading-normal focus:outline-none"

        placeholder="Enter code or describe a task..."

        spellCheck="false"

      />

    </div>

  );

};
export default CodeEditor;