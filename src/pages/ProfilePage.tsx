import { useState } from 'react';
import { CheckCircle2, DoorOpen, LogOut, MessageSquareText } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export function ProfilePage() {
  const { guest, logout } = useAuth();
  const { t } = useLang();
  const [feedback, setFeedback] = useState('');
  const [sent, setSent] = useState(false);

  const sendFeedback = async () => {
    if (!feedback.trim()) return;
    await api.post('/feedback', { text: feedback.trim() });
    setFeedback('');
    setSent(true);
  };

  if (!guest) return null;

  const initials = guest.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="page">
      <h1>{t('profile.title')}</h1>
      <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="avatar-circle">{initials}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{guest.name}</div>
          <div className="muted">Комната {guest.roomNumber}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="status-icon-badge" style={{ width: 44, height: 44, margin: 0, background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
          <DoorOpen size={20} />
        </div>
        <div>
          <div className="muted">{t('profile.access')}</div>
          <span className="badge success">{t(`status.${guest.accessStatus}`)}</span>
        </div>
      </div>

      <h2>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MessageSquareText size={16} /> {t('profile.feedback')}
        </span>
      </h2>
      {sent ? (
        <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={20} color="var(--color-success)" />
          <span>{t('profile.feedbackSent')}</span>
        </div>
      ) : (
        <>
          <textarea
            className="input"
            rows={3}
            placeholder={t('profile.feedbackPlaceholder')}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button className="btn block" style={{ marginTop: 10 }} onClick={sendFeedback}>
            {t('profile.feedbackSend')}
          </button>
        </>
      )}

      <button className="btn ghost block" style={{ marginTop: 28 }} onClick={logout}>
        <LogOut size={16} /> {t('profile.logout')}
      </button>
    </div>
  );
}
