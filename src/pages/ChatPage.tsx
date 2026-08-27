import { useEffect, useRef, useState } from 'react';
import { Camera, MessageCircle, Send } from 'lucide-react';
import { api, API_URL } from '../api/client';
import { ChatMessage } from '../api/types';
import { useLang } from '../context/LangContext';

// Real-time-ish delivery via short polling instead of Socket.io/WebSocket — the backend runs
// as Vercel serverless functions in production, which don't hold persistent WS connections.
// A few seconds of latency is an acceptable trade-off for a hotel guest chat.
const POLL_MS = 3000;

export function ChatPage() {
  const { t } = useLang();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => api.get<ChatMessage[]>('/chat/messages').then(setMessages).catch(() => {});

  useEffect(() => {
    load();
    api.patch('/chat/messages/read').catch(() => {});
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = async () => {
    const value = text.trim();
    if (!value) return;
    setText('');
    const message = await api.post<ChatMessage>('/chat/messages', { text: value });
    setMessages((prev) => [...prev, message]);
  };

  const sendPhoto = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { url } = await api.post<{ url: string }>('/upload/guest', form);
      const message = await api.post<ChatMessage>('/chat/messages', { photo: url });
      setMessages((prev) => [...prev, message]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="chat-wrap">
      <div className="chat-header">
        <div className="avatar-circle" style={{ width: 34, height: 34, fontSize: '0.9rem' }}>
          🏨
        </div>
        Отель на связи
      </div>
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="icon-wrap">
              <MessageCircle size={24} />
            </div>
            <p>{t('chat.empty')}</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m._id} className={`chat-bubble ${m.sender}`}>
            {m.text && <div>{m.text}</div>}
            {m.photo && <img src={m.photo.startsWith('http') ? m.photo : `${API_URL}${m.photo}`} alt="" />}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <button className="chat-icon-btn" disabled={uploading} onClick={() => fileRef.current?.click()}>
          <Camera size={19} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files?.[0] && sendPhoto(e.target.files[0])}
        />
        <input
          type="text"
          className="input"
          placeholder={t('chat.placeholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="chat-send-btn" onClick={send}>
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}
