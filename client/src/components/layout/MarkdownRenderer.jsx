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

                    // Enhanced helper function to process inline styles
                    const processInline = (text) => {
                        return text
                            // Inline code (backticks) - process first to avoid conflicts
                            .replace(/`([^`]+)`/g, '<code class="bg-gray-700 text-yellow-300 rounded px-1.5 py-0.5 text-sm font-mono">$1</code>')
                            // Bold with ** or __
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
                            .replace(/__(.*?)__/g, '<strong class="font-bold text-white">$1</strong>')
                            // Italics with * or _ (single, not already processed)
                            .replace(/(?<!\*)\*([^*\s][^*]*[^*\s]|\S)\*(?!\*)/g, '<em class="italic text-gray-200">$1</em>')
                            .replace(/(?<!_)_([^_\s][^_]*[^_\s]|\S)_(?!_)/g, '<em class="italic text-gray-200">$1</em>')
                            // Strikethrough with ~~
                            .replace(/~~(.*?)~~/g, '<del class="line-through text-gray-500">$1</del>')
                            // Links [text](url)
                            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline transition-colors duration-200">$1</a>')
                            // Highlight with ==text==
                            .replace(/==(.*?)==/g, '<mark class="bg-yellow-400 text-black px-1 rounded">$1</mark>')
                            // Subscript with ~text~
                            .replace(/~([^~\s]+)~/g, '<sub class="text-xs">$1</sub>')
                            // Superscript with ^text^
                            .replace(/\^([^^]+)\^/g, '<sup class="text-xs">$1</sup>')
                            // Keyboard keys with [[key]]
                            .replace(/\[\[([^\]]+)\]\]/g, '<kbd class="bg-gray-600 text-gray-200 px-2 py-1 rounded text-xs font-mono border border-gray-500">$1</kbd>')
                            // Escape sequences for literal markdown characters
                            .replace(/\\([*_~`\[\](){}#+-.])/g, '$1');
                    };

                    // Process different line types
                    if (/^### /.test(line)) {
                        const content = processInline(line.slice(4));
                        return <h3 key={key} className="text-xl font-semibold mt-6 mb-2 text-indigo-300" dangerouslySetInnerHTML={{ __html: content }} />;
                    }
                    if (/^## /.test(line)) {
                        const content = processInline(line.slice(3));
                        return <h2 key={key} className="text-2xl font-bold mt-8 mb-3 text-indigo-200" dangerouslySetInnerHTML={{ __html: content }} />;
                    }
                    if (/^# /.test(line)) {
                        const content = processInline(line.slice(2));
                        return <h1 key={key} className="text-3xl font-bold mt-8 mb-4 text-indigo-100" dangerouslySetInnerHTML={{ __html: content }} />;
                    }
                    if (/^#### /.test(line)) {
                        const content = processInline(line.slice(5));
                        return <h4 key={key} className="text-lg font-semibold mt-4 mb-2 text-indigo-400" dangerouslySetInnerHTML={{ __html: content }} />;
                    }
                    if (/^##### /.test(line)) {
                        const content = processInline(line.slice(6));
                        return <h5 key={key} className="text-base font-semibold mt-4 mb-2 text-indigo-400" dangerouslySetInnerHTML={{ __html: content }} />;
                    }
                    if (/^###### /.test(line)) {
                        const content = processInline(line.slice(7));
                        return <h6 key={key} className="text-sm font-semibold mt-4 mb-2 text-indigo-400" dangerouslySetInnerHTML={{ __html: content }} />;
                    }
                    // Unordered list items
                    if (/^[\*\-\+] /.test(line)) {
                        const content = processInline(line.slice(2));
                        return <li key={key} className="ml-6 list-disc text-gray-300 my-1" dangerouslySetInnerHTML={{ __html: content }} />;
                    }
                    // Ordered list items
                    if (/^\d+\. /.test(line)) {
                        const content = processInline(line.replace(/^\d+\. /, ''));
                        return <li key={key} className="ml-6 list-decimal text-gray-300 my-1" dangerouslySetInnerHTML={{ __html: content }} />;
                    }
                    // Blockquotes
                    if (/^> /.test(line)) {
                        const content = processInline(line.slice(2));
                        return <blockquote key={key} className="border-l-4 border-blue-500 pl-4 my-2 text-gray-300 italic bg-gray-800/30 py-2" dangerouslySetInnerHTML={{ __html: content }} />;
                    }
                    // Horizontal rules
                    if (/^---$/.test(line) || /^\*\*\*$/.test(line) || /^___$/.test(line)) {
                        return <hr key={key} className="my-6 border-gray-700" />;
                    }
                    // Empty lines
                    if (line.trim() === '') {
                        return <br key={key} />;
                    }

                    // Regular paragraphs
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