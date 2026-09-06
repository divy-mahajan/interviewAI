import React, { useState } from 'react';

export const CodeBlock = ({ language, code }) => {
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
        <div className="ai-code-block">
            <div className="ai-code-block__header">
                <span className="language-tag">{language || 'code'}</span>
                <button
                    className="copy-btn"
                    onClick={handleCopy}
                    type="button"
                    title="Copy code to clipboard"
                >
                    {copied ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Copied!
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="ai-code-block__content">
                <code>{code}</code>
            </pre>
        </div>
    );
};

/**
 * Parses markdown text containing code blocks and regular paragraphs
 */
export const FormattedAIMessage = ({ content }) => {
    if (!content) return null;

    // Regular expression to match fenced code blocks ```language ... ```
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        // Push preceding text if any
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                text: content.substring(lastIndex, match.index)
            });
        }

        // Push code block
        parts.push({
            type: 'code',
            language: match[1] || 'text',
            code: match[2].trimEnd()
        });

        lastIndex = match.index + match[0].length;
    }

    // Push remaining text after last code block
    if (lastIndex < content.length) {
        parts.push({
            type: 'text',
            text: content.substring(lastIndex)
        });
    }

    // If no code blocks were found, return simple formatted text
    if (parts.length === 0) {
        return <div className="ai-text-content">{content}</div>;
    }

    return (
        <div className="ai-message-body">
            {parts.map((part, index) => {
                if (part.type === 'code') {
                    return (
                        <CodeBlock
                            key={index}
                            language={part.language}
                            code={part.code}
                        />
                    );
                }

                return (
                    <div key={index} className="ai-text-content">
                        {part.text}
                    </div>
                );
            })}
        </div>
    );
};

export default FormattedAIMessage;
