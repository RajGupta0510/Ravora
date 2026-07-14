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
      borderRadius: '12px',
      border: '1px solid var(--border)',
      background: 'rgba(14, 19, 37, 0.45)',
      overflow: 'hidden'
    }}>
      
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <MessageSquareCode size={18} style={{ color: 'var(--ai-accent)' }} />
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>Araiven Advisor Sandbox</h2>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Continuous Audit & Reasoning System</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {copilotHistory.map((msg, idx) => (
          <div 
            key={idx}
            className={`msg-bubble ${msg.sender === 'user' ? 'user' : 'copilot'}`}
            style={{
              maxWidth: '80%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              lineHeight: 1.45,
              background: msg.sender === 'user' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.02)',
              border: msg.sender === 'user' ? '1px solid rgba(37,99,235,0.2)' : '1px solid rgba(255,255,255,0.04)',
              color: '#fff',
              boxSizing: 'border-box'
            }}
          >
            <p style={{ margin: 0 }}>{msg.text}</p>
            {msg.actionHtml && (
              <div 
                style={{ marginTop: '10px' }}
                dangerouslySetInnerHTML={{ __html: msg.actionHtml }}
              />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset prompts & Input section */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Preset prompts badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {presetPrompts.map((p) => (
            <button
              key={p.key}
              onClick={() => { setInputText(p.text); }}
              disabled={sending}
              className="chat-suggest-btn"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.15s'
              }}
            >
              {p.text}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', width: '100%', position: 'relative' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Query Araiven strategy details or ask for rebalance audits..."
            style={{
              flex: 1,
              padding: '12px 48px 12px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)',
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
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
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
