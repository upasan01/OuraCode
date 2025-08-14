import React, { useState, useEffect, useRef } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import csharp from 'react-syntax-highlighter/dist/esm/languages/hljs/csharp';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import ruby from 'react-syntax-highlighter/dist/esm/languages/hljs/ruby';
import go from 'react-syntax-highlighter/dist/esm/languages/hljs/go';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Copy, Check } from 'lucide-react';

// Registering languages for the syntax highlighter
SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('css', css);

// Enhanced CodeBlock component with copy functionality
const CodeBlock = ({ language, code, index }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    return (
        <div key={`code-block-${index}`} className="my-4 relative group">
            {/* Copy Button */}
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 bg-gray-700/80 hover:bg-gray-600 text-gray-300 hover:text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-sm"
                title={copied ? "Copied!" : "Copy code"}
            >
                {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                ) : (
                    <Copy className="w-4 h-4" />
                )}
            </button>
            
            
            <SyntaxHighlighter
                language={language}
                style={atomOneDark}
                wrapLongLines
                customStyle={{ 
                    margin: 0, 
                    borderRadius: '0.5rem',
                    paddingTop: '1rem',
                    paddingBottom: '1rem'
                }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
};

const MarkdownRenderer = ({ text, onUseCode }) => {
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;

    const parseMarkdown = (markdownText) => {
        const parts = markdownText.split(/(```(?:\w*)\n[\s\S]*?\n```)/g);
        return parts.map((part, index) => {
            const codeMatch = part.match(/```(\w*)\n([\s\S]*?)\n```/);
            if (codeMatch) {
                const language = codeMatch[1] || 'text';
                const code = codeMatch[2];
                return <CodeBlock language={language} code={code} index={index} />;
            } else {
                return part.split('\n').map((line, lineIndex) => {
                    const key = `text-${index}-${lineIndex}`;

                    // Helper function to process inline styles like bold and code
                    const processInline = (text) => {
                        return text
                            .replace(/`([^`]+)`/g, '<code class="bg-gray-700 text-yellow-300 rounded px-1.5 py-0.5 text-sm font-mono">$1</code>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
                    };

                    if (/^### /.test(line)) {
                        const content = processInline(line.slice(4));
                        return <h3 key={key} className="text-xl font-semibold mt-6 mb-2 text-indigo-300" dangerouslySetInnerHTML={{ __html: content }} />;
                    }
                    if (/^## /.test(line)) {
                        const content = processInline(line.slice(3));
                        return <h2 key={key} className="text-2xl font-bold mt-8 mb-3 text-indigo-200" dangerouslySetInnerHTML={{ __html: content }} />;
                    }
                    if (/^\* /.test(line)) {
                        const content = processInline(line.slice(2));
                        return <li key={key} className="ml-6 list-disc text-gray-300 my-1" dangerouslySetInnerHTML={{ __html: content }} />;
                    }
                    if (/^---$/.test(line)) {
                        return <hr key={key} className="my-6 border-gray-700" />;
                    }
                    if (line.trim() === '') {
                        return <br key={key} />;
                    }

                    const content = processInline(line);
                    return <p key={key} className="my-2 text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />;
                });
            }
        });
    };

    const codeBlocks = [...text.matchAll(codeBlockRegex)];
    const lastCodeBlock = codeBlocks.length > 0 ? codeBlocks[codeBlocks.length - 1][2]?.trim() : '';

    return (
        <div className="prose prose-invert max-w-none">
            {parseMarkdown(text)}
            {lastCodeBlock && onUseCode && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Quick Actions</span>
                    </div>
                    <button
                        onClick={() => onUseCode(lastCodeBlock)}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Use Last Code Snippet
                    </button>
                </div>
            )}
        </div>
    );
};
export default MarkdownRenderer;