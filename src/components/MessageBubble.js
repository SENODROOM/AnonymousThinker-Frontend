import React, { useState } from 'react';

const parseMarkdown = (text) => {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`
  );
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.split('\n\n').map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<pre') || p.startsWith('<blockquote')) return p;
    return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');
  return html;
};

const MessageBubble = ({ message, isLast }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className={`message-row message-row--${isUser ? 'user' : 'ai'}${isLast ? ' message-row--new' : ''}`}>
      {!isUser && (
        <div className="msg-avatar msg-avatar--ai">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          </svg>
        </div>
      )}

      <div className="msg-content-wrap">
        {!isUser && (
          <span className="msg-role-name">AnonymousThinker</span>
        )}

        <div className={`msg-bubble msg-bubble--${isUser ? 'user' : 'ai'}${message.comparisonContent ? ' msg-bubble--comparison' : ''}`}>
          {isUser ? (
            <p>{message.content}</p>
          ) : message.comparisonContent ? (
            <div className="comparison-container">
              <div className="comparison-pane">
                <span className="comparison-label">Personal Model (8B)</span>
                <div
                  className="message-content"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                />
              </div>
              <div className="comparison-pane comparison-pane--powerful">
                <span className="comparison-label">Powerful Model (70B)</span>
                <div
                  className="message-content"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(message.comparisonContent) }}
                />
              </div>
            </div>
          ) : (
            <div
              className="message-content"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
            />
          )}
        </div>

        <div className={`msg-meta${isUser ? ' msg-meta--user' : ''}`}>
          <span className="msg-timestamp">{formattedTime}</span>
          {!isUser && (
            <button onClick={handleCopy} className="msg-copy-btn" title="Copy response">
              {copied ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="msg-avatar msg-avatar--user">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </div>
  );
};

export const TypingIndicator = () => (
  <div className="typing-indicator">
    <div className="msg-avatar msg-avatar--ai">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      </svg>
    </div>
    <div>
      <span className="msg-role-name">AnonymousThinker</span>
      <div className="typing-bubble">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="typing-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default MessageBubble;