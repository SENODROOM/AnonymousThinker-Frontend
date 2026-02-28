import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import MessageBubble, { TypingIndicator } from '../components/MessageBubble';

const WELCOME_PROMPTS = [
  "What's on your mind?",
  "Ask me anything — I'm thinking.",
  "Explore an idea with me.",
  "Let's reason through something together.",
];

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    conversations, currentConversation, loading, sending, error,
    fetchConversations, createConversation, loadConversation, sendMessage, setError
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [compare, setCompare] = useState(false);
  const [welcomePrompt] = useState(WELCOME_PROMPTS[Math.floor(Math.random() * WELCOME_PROMPTS.length)]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const lastIdRef = useRef(id);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (id) loadConversation(id);
  }, [id, loadConversation]);

  useEffect(() => {
    if (messagesEndRef.current) {
      const isSwitching = lastIdRef.current !== id;
      messagesEndRef.current.scrollIntoView({
        behavior: isSwitching ? 'auto' : 'smooth'
      });
      lastIdRef.current = id;
    }
  }, [currentConversation?.messages, id, sending]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending) return;
    setError(null);
    let convId = id;
    if (!convId) {
      const conv = await createConversation();
      if (!conv) return;
      convId = conv._id;
      navigate(`/chat/${convId}`, { replace: true });
      await new Promise(r => setTimeout(r, 100));
    }
    const msg = input.trim();
    const isComparing = compare; // Capture current state
    setInput('');
    try {
      await sendMessage(convId, msg, isComparing);
    } catch (err) {
      setInput(msg);
    }
  }, [input, sending, id, createConversation, navigate, sendMessage, setError, compare]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    const conv = await createConversation();
    if (conv) navigate(`/chat/${conv._id}`);
  };

  const handleSuggestion = (text) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const messages = currentConversation?.messages || [];
  const isNewChat = !id || messages.length === 0;

  return (
    <div className="layout-root">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`main${sidebarOpen ? ' main--sidebar-open' : ''}`}>
        {/* Top bar */}
        <div className="topbar">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="topbar__menu-btn" title="Toggle sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="topbar__title">
            {currentConversation?.title || 'New Chat'}
          </div>
          <button onClick={handleNewChat} className="topbar__new-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Messages area */}
        <div className="messages-area">
          {isNewChat ? (
            <div className="welcome">
              <div className="welcome__logo">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="white" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <path d="M5.5 5.5l2.8 2.8M15.7 15.7l2.8 2.8M5.5 18.5l2.8-2.8M15.7 8.3l2.8-2.8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                </svg>
              </div>
              <h1 className="welcome__title">AnonymousThinker</h1>
              <p className="welcome__subtitle">{welcomePrompt}</p>

              <div className="suggestions">
                {[
                  { icon: '💡', text: 'Explain quantum entanglement simply', label: 'Science' },
                  { icon: '🧠', text: 'What are the most effective study techniques?', label: 'Learning' },
                  { icon: '🚀', text: 'How do I start a tech startup in 2024?', label: 'Business' },
                  { icon: '📝', text: 'Write a haiku about artificial intelligence', label: 'Creative' },
                ].map((s, i) => (
                  <button key={i} onClick={() => handleSuggestion(s.text)} className="suggestion-card">
                    <span className="suggestion-card__icon">{s.icon}</span>
                    <span className="suggestion-card__label">{s.label}</span>
                    <span className="suggestion-card__text">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg._id || i}
                  message={msg}
                  isLast={i === messages.length - 1}
                />
              ))}
              {sending && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Notification Area */}
        {/* <div style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div className="alert alert--error fade-in">
              <span>⚠️</span>
              <div style={{ flex: 1 }}>{error}</div>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '10px' }}>✕</button>
            </div>
          )}
        </div> */}

        {/* Input area */}
        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AnonymousThinker... (Shift+Enter for new line)"
              className="input-textarea"
              rows={1}
              disabled={sending}
            />
            <div className="input-footer">
              <div className="input-footer__left">
                <button
                  onClick={() => setCompare(!compare)}
                  className={`compare-toggle${compare ? ' compare-toggle--active' : ''}`}
                  title="Compare with DeepSeek-R1-70B"
                  disabled={sending}
                >
                  <div className="compare-toggle__dot" />
                  Compare Models
                </button>
                <span className={`input-hint${sending ? ' input-hint--thinking' : ''}`}>
                  {sending ? '● Thinking...' : 'Enter to send · Shift+Enter for new line'}
                </span>
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="send-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
          <p className="input-disclaimer">
            AnonymousThinker can make mistakes. Verify important info.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;