import { useState } from 'react';
import { Bell, CheckCircle2, DoorOpen, Languages, LogOut, MessageSquareText, Monitor, Moon, Sun } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { ThemeMode, useTheme } from '../context/ThemeContext';
import { LANGS } from '../i18n/dictionaries';
import { PageHeader } from '../components/PageHeader';
import { initialsOf } from '../utils/initials';
import { useNotifications } from '../context/NotificationsContext';

const THEME_OPTIONS: { mode: ThemeMode; Icon: typeof Sun; key: string }[] = [
  { mode: 'light', Icon: Sun, key: 'profile.theme.light' },
  { mode: 'dark', Icon: Moon, key: 'profile.theme.dark' },
  { mode: 'system', Icon: Monitor, key: 'profile.theme.system' },
];

export function ProfilePage() {
  const { guest, logout } = useAuth();
  const { t, lang, setLang } = useLang();
  const { mode, setMode } = useTheme();
  const { permission, enable } = useNotifications();
  const [feedback, setFeedback] = useState('');
  const [sent, setSent] = useState(false);

  const sendFeedback = async () => {
    if (!feedback.trim()) return;
    await api.post('/feedback', { text: feedback.trim() });
    setFeedback('');
    setSent(true);
  };

  if (!guest) return null;

  return (
    <div className="page page--narrow">
      <PageHeader title={t('profile.title')} />

      <div className="card profile-card">
        <div className="avatar-circle">{initialsOf(guest.name)}</div>
        <div className="profile-card__text">
          <div className="profile-card__name">{guest.name}</div>
          <div className="muted">
            {t('profile.room')} {guest.roomNumber}
            {guest.phone ? ` · ${guest.phone}` : ''}
          </div>
          <div className="profile-card__meta">
            <span className="badge success">
              <DoorOpen size={13} /> {t('profile.access')}: {t(`status.${guest.accessStatus}`)}
            </span>
          </div>
        </div>
      </div>

      <h2>{t('profile.settings')}</h2>
      <div className="card settings-card">
        <div className="setting-row">
          <div className="setting-row__label">
            <span className="setting-row__icon" style={{ background: 'var(--color-purple-light)', color: 'var(--color-purple-dark)' }}>
              <Moon size={17} />
            </span>
            {t('profile.theme')}
          </div>
          <div className="segmented" role="radiogroup" aria-label={t('profile.theme')}>
            {THEME_OPTIONS.map(({ mode: m, Icon, key }) => (
              <button key={m} type="button" role="radio" aria-checked={mode === m} className={mode === m ? 'active' : ''} onClick={() => setMode(m)}>
                <Icon size={15} /> {t(key)}
              </button>
            ))}
          </div>
          <div className="setting-row__hint">{t('profile.theme.systemHint')}</div>
        </div>

        <div className="setting-row">
          <div className="setting-row__label">
            <span className="setting-row__icon" style={{ background: 'var(--color-blue-light)', color: 'var(--color-blue-dark)' }}>
              <Languages size={17} />
            </span>
            {t('profile.language')}
          </div>
          <div className="segmented" role="radiogroup" aria-label={t('profile.language')}>
            {LANGS.map((l) => (
              <button key={l.code} type="button" role="radio" aria-checked={lang === l.code} className={lang === l.code ? 'active' : ''} onClick={() => setLang(l.code)}>
                {l.name}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-row setting-row--inline">
          <div className="setting-row__label">
            <span className="setting-row__icon" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent-dark)' }}>
              <Bell size={17} />
            </span>
            <span className="setting-row__labels">
              {t('profile.notifications')}
              <span className="setting-row__state">{t(`profile.notifications.${permission}`)}</span>
            </span>
          </div>
          {permission === 'default' && (
            <button type="button" className="btn sm" onClick={enable}>
              {t('notifications.enableButton')}
            </button>
          )}
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
          <button className="btn block" style={{ marginTop: 10 }} disabled={!feedback.trim()} onClick={sendFeedback}>
            {t('profile.feedbackSend')}
          </button>
        </>
      )}

      <button className="btn ghost block" style={{ marginTop: 24, marginBottom: 8 }} onClick={logout}>
        <LogOut size={16} /> {t('profile.logout')}
      </button>
    </div>
  );
}
