import React from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

export default function ContentRenderer({ content }) {
  if (!content) return null;

  // Split by triple backticks for block code
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="rendered-content">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code content
          const contentWithoutTicks = part.slice(3, -3);
          const firstNewlineIndex = contentWithoutTicks.indexOf('\n');
          let lang = '';
          let code = contentWithoutTicks;
          
          if (firstNewlineIndex !== -1) {
            lang = contentWithoutTicks.slice(0, firstNewlineIndex).trim();
            code = contentWithoutTicks.slice(firstNewlineIndex + 1);
          }

          let highlighted;
          try {
            if (lang && hljs.getLanguage(lang)) {
              highlighted = hljs.highlight(code, { language: lang }).value;
            } else {
              highlighted = hljs.highlightAuto(code).value;
            }
          } catch (e) {
            highlighted = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          }

          return (
            <pre key={index} className="code-block-container">
              {lang && <span className="code-lang-badge">{lang.toUpperCase()}</span>}
              <code
                className={`hljs ${lang ? `language-${lang}` : ''}`}
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            </pre>
          );
        } else {
          // Regular text, split by single backticks for inline code
          const inlineParts = part.split(/(`[^`\n]+`)/g);
          return (
            <span key={index} className="text-segment">
              {inlineParts.map((subPart, subIndex) => {
                if (subPart.startsWith('`') && subPart.endsWith('`')) {
                  const inlineCode = subPart.slice(1, -1);
                  return (
                    <code key={subIndex} className="inline-code">
                      {inlineCode}
                    </code>
                  );
                }
                return subPart;
              })}
            </span>
          );
        }
      })}
    </div>
  );
}
