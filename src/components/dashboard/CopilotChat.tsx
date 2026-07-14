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
      height: 'calc(100vh - 140px)',
      borderRadius: 'var(--radius-md)',
      border: 'var(--border-thickness) solid var(--color-border)',
      background: 'rgba(14, 19, 37, 0.45)',
      overflow: 'hidden'
    }}>
      
      {/* Header */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        borderBottom: 'var(--border-thickness) solid var(--color-border-divider)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2.5)'
      }}>
        <MessageSquareCode size={18} style={{ color: 'var(--color-ai-accent)' }} />
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Araiven Advisor Sandbox</h2>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Continuous Audit & Reasoning System</span>
        </div>
      </div>
 
      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        padding: 'var(--space-6)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)'
      }}>
        {copilotHistory.map((msg, idx) => (
          <div 
            key={idx}
            className={`msg-bubble ${msg.sender === 'user' ? 'user' : 'copilot'}`}
            style={{
              maxWidth: '80%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              lineHeight: 1.45,
              background: msg.sender === 'user' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.02)',
              border: msg.sender === 'user' ? 'var(--border-thickness) solid rgba(37,99,235,0.2)' : 'var(--border-thickness) solid var(--color-border-divider)',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          >
            <p style={{ margin: 0 }}>{msg.text}</p>
            {msg.actionHtml && (
              <div 
                style={{ marginTop: 'var(--space-2.5)' }}
                dangerouslySetInnerHTML={{ __html: msg.actionHtml }}
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
 
      {/* Preset prompts & Input section */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        borderTop: 'var(--border-thickness) solid var(--color-border-divider)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)'
      }}>
        {/* Preset prompts badges */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {presetPrompts.map((p) => (
            <button
              key={p.key}
              onClick={() => { setInputText(p.text); }}
              disabled={sending}
              className="chat-suggest-btn"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: 'var(--border-thickness) solid rgba(255,255,255,0.06)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-1.5) var(--space-3)',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all var(--transition-hover)'
              }}
            >
              {p.text}
            </button>
          ))}
        </div>
 
        {/* Input box */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-2.5)', width: '100%', position: 'relative' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Query Araiven strategy details or ask for rebalance audits..."
            style={{
              flex: 1,
              padding: 'var(--space-3) var(--space-12) var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: 'var(--border-thickness) solid var(--color-border)',
              background: 'rgba(255,255,255,0.03)',
              color: '#fff',
              fontSize: '0.82rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <button 
            type="submit"
            disabled={sending || !inputText.trim()}
            style={{
              position: 'absolute',
              right: 'var(--space-2)',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 'var(--space-1.5)'
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
