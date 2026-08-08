import React from 'react';
import { Marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const marked = new Marked();

const customRenderer = {
  code({ text, lang }) {
    const validLang = lang && hljs.getLanguage(lang) ? lang : '';
    let highlighted;
    try {
      if (validLang) {
        highlighted = hljs.highlight(text, { language: validLang }).value;
      } else {
        highlighted = hljs.highlightAuto(text).value;
      }
    } catch (e) {
      highlighted = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    return `<pre class="code-block-container">${
      validLang ? `<span class="code-lang-badge">${validLang.toUpperCase()}</span>` : ''
    }<code class="hljs ${validLang ? `language-${validLang}` : ''}">${highlighted}</code></pre>`;
  },
  codespan({ text }) {
    return `<code class="inline-code">${text}</code>`;
  }
};

marked.use({
  gfm: true,
  breaks: true,
  renderer: customRenderer
});

export default function ContentRenderer({ content }) {
  if (!content) return null;

  const html = marked.parse(content);

  return (
    <div
      className="rendered-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
