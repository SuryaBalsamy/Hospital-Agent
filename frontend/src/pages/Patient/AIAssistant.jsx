import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/common/Card'
import { patientService } from '../../services/patientService'
import { toast } from 'react-hot-toast'

// Basic Markdown Parser (since we don't have react-markdown installed)
function renderMarkdown(text) {
  if (!text) return { __html: '' };
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
  return { __html: html };
}

const LogoIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="hc-gradient-ai" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    <rect width="42" height="42" rx="10" fill="url(#hc-gradient-ai)" />
    <path d="M15 21H27M21 15V27" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
    <path d="M10 32H13L16 27L18 37L21 23L23 35L26 31L28 32H32" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
  </svg>
)

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I'm your AI Hospital Assistant. I can help you book appointments, find doctors, check wait times, and answer health queries. How can I help you today? 😊" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await patientService.getChatHistory();
      if (data.history && data.history.length > 0) {
        setMessages([
          { role: 'ai', text: "Hello! I'm your AI Hospital Assistant. How can I help you today? 😊" },
          ...data.history
        ]);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setIsLoading(true);
    
    try {
      const { data } = await patientService.sendChatMessage({ message: userMsg });
      setMessages(m => [...m, { role: 'ai', text: data.response }]);
    } catch (error) {
      toast.error("Failed to communicate with AI");
      setMessages(m => [...m, { role: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionText) => {
    setInput(actionText);
    setTimeout(() => {
        document.getElementById("chat-send-btn")?.click();
    }, 100);
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied!");
  };

  const clearChat = () => {
    setMessages([
        { role: 'ai', text: "Hello! I'm your AI Hospital Assistant. How can I help you today? 😊" }
    ]);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <LogoIcon size={46} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>AI Health Assistant</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>● Online & Active</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" style={{ background: '#ffffff', border: '1px solid var(--border)' }} onClick={clearChat}>Clear Chat</button>
          </div>
        </div>

        <Card style={{ padding: 0, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
          {/* Chat messages */}
          <div style={{ padding: '1.75rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#F8FAFC' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}>
                {m.role === 'ai' && (
                  <div style={{ marginRight: '0.75rem', flexShrink: 0 }}>
                    <LogoIcon size={34} />
                  </div>
                )}
                <div style={{
                  maxWidth: '75%', padding: '1.1rem 1.4rem',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user' ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : '#ffffff',
                  color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '0.96rem', lineHeight: 1.6,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  position: 'relative',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border)'
                }}>
                  <div dangerouslySetInnerHTML={renderMarkdown(m.text)} />
                  
                  {m.role === 'ai' && (
                     <button 
                       onClick={() => copyMessage(m.text)}
                       style={{ position: 'absolute', bottom: -20, right: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}
                       title="Copy message"
                     >
                       📋 Copy
                     </button>
                  )}
                </div>
                {m.role === 'user' && (
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', background: 'var(--primary-glow)', border: '1.5px solid var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)',
                    marginLeft: '0.75rem', flexShrink: 0
                  }}>
                    ME
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <div style={{ marginRight: '0.75rem', flexShrink: 0 }}>
                  <LogoIcon size={34} />
                </div>
                <div style={{
                  padding: '1rem 1.4rem', borderRadius: '18px 18px 18px 4px', background: '#ffffff',
                  display: 'flex', gap: '5px', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}>
                  <span className="typing-dot"></span>
                  <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
                  <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div style={{ padding: '0.85rem 1.75rem', display: 'flex', gap: '0.6rem', overflowX: 'auto', background: '#ffffff', borderTop: '1px solid var(--border)' }} className="hide-scrollbar">
                {['📅 Book Appointment', '🗺️ Where is the MRI?', '⏳ My Queue Position', '💊 Check Availability'].map(action => (
                    <button 
                        key={action} 
                        onClick={() => handleQuickAction(action.replace(/📅 |🗺️ |⏳ |💊 /g, ''))}
                        style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', borderRadius: '20px', border: '1.5px solid var(--primary)', background: '#ffffff', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}
                        onMouseOver={e => { e.target.style.background = 'var(--primary)'; e.target.style.color = '#ffffff'; }}
                        onMouseOut={e => { e.target.style.background = '#ffffff'; e.target.style.color = 'var(--primary)'; }}
                    >
                        {action}
                    </button>
                ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', background: '#ffffff', alignItems: 'center' }}>
            <input
              type="text" className="form-input" placeholder="Type your health question or command..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, borderRadius: '28px', padding: '0.85rem 1.5rem', background: '#F8FAFC', border: '1.5px solid var(--border)' }}
              disabled={isLoading}
            />
            <button 
                id="chat-send-btn"
                className="btn btn-primary" 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                style={{ borderRadius: '28px', padding: '0.85rem 1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                Send <span>↗</span>
            </button>
          </div>
        </Card>
      </div>

      <style>{`
        .typing-dot {
            width: 6px; height: 6px; background: var(--primary); borderRadius: 50%; display: inline-block; animation: typing 1.4s infinite ease-in-out both;
        }
        @keyframes typing {
            0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </DashboardLayout>
  )
}
