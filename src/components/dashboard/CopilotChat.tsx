import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquareCode, Send } from 'lucide-react';

export const CopilotChat: React.FC = () => {
  const { copilotHistory, sendCopilotMessage } = useApp();
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    try {
      setSending(true);
      const text = inputText;
      setInputText('');
      await sendCopilotMessage(text);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotHistory]);

  const presetPrompts = [
    { key: 'eth-exposure', text: 'Should I increase exposure to Ethereum?' },
    { key: 'risk-model', text: 'What is my current risk model setting?' },
    { key: 'macro-scans', text: 'What global events is Araiven monitoring?' }
  ];

  return (
    <div className="card-glass" style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - clamp(140px, 18vh, 180px))',
      borderRadius: '12px',
      border: 'var(--border-thickness) solid var(--color-border)',
      background: '#151a26',
      overflow: 'hidden'
    }}>
      
      {/* Header */}
      <div style={{
        padding: '12px clamp(14px, 2.5vw, 24px)',
        borderBottom: 'var(--border-thickness) solid var(--color-border-divider)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <MessageSquareCode size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>Araiven Advisor Sandbox</h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Continuous Audit & Reasoning System</span>
        </div>
      </div>
 
      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        padding: 'clamp(12px, 2.5vw, 20px)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {copilotHistory.map((msg, idx) => (
          <div 
            key={idx}
            className={`msg-bubble ${msg.sender === 'user' ? 'user' : 'copilot'}`}
            style={{
              maxWidth: '88%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              lineHeight: 1.45,
              background: msg.sender === 'user' ? 'rgba(245, 158, 11, 0.12)' : '#10141d',
              border: msg.sender === 'user' ? '1px solid rgba(245, 158, 11, 0.28)' : '1px solid var(--border)',
              color: msg.sender === 'user' ? '#f8fafc' : 'var(--text-secondary)',
              boxSizing: 'border-box'
            }}
          >
            <p style={{ margin: 0 }}>{msg.text}</p>
            {msg.actionHtml && (
              // Rendered as text, never as HTML: this string comes from the server/model and must not be able to inject markup.
              <div style={{ marginTop: '8px' }}>{msg.actionHtml.replace(/<[^>]*>/g, '')}</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
 
      {/* Preset prompts & Input section */}
      <div style={{
        padding: '12px clamp(12px, 2.5vw, 20px)',
        borderTop: 'var(--border-thickness) solid var(--color-border-divider)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: '#10141d'
      }}>
        {/* Preset prompts badges */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '2px' }}>
          {presetPrompts.map((p) => (
            <button
              key={p.key}
              onClick={() => { setInputText(p.text); }}
              disabled={sending}
              className="chat-suggest-btn"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '7px',
                padding: '6px 12px',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {p.text}
            </button>
          ))}
        </div>
 
        {/* Input box */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', width: '100%', position: 'relative' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Query Araiven strategy details..."
            style={{
              flex: 1,
              padding: '10px 42px 10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: '#0e121b',
              color: '#f8fafc',
              fontSize: '0.8rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <button 
            type="submit"
            disabled={sending || !inputText.trim()}
            aria-label="Send message"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: inputText.trim() ? '#f59e0b' : 'var(--text-muted)',
              cursor: inputText.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default CopilotChat;
