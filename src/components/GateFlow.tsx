import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { Check, Clock3, Compass, Lock, Phone, RotateCw, TriangleAlert } from 'lucide-react';
import { ContactChannel, useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { ApiError } from '../api/client';
import { LangSwitcher } from './LangSwitcher';
import { GateSteps, ProfileStep, RulesStep } from './gate/RegistrationSteps';

// Messengers offered on the registration form. WhatsApp/Viber reach the guest through the
// phone number itself, so they don't get a username field (keeps the form one screen tall).
const CHANNELS: { type: ContactChannel; label: string; color: string; phoneBased?: boolean; at?: boolean }[] = [
  { type: 'telegram', label: 'Telegram', color: '#2AABEE', at: true },
  { type: 'whatsapp', label: 'WhatsApp', color: '#25D366', phoneBased: true },
  { type: 'instagram', label: 'Instagram', color: '#E1306C', at: true },
  { type: 'wechat', label: 'WeChat', color: '#09B83E' },
  { type: 'viber', label: 'Viber', color: '#7360F2', phoneBased: true },
  { type: 'other', label: '', color: '#9A8C78' },
];

// Registration gate: name+room+phone -> country + date of birth -> sign the house rules ->
// wait for the stay to be confirmed (confirming opens access). The hotel review is no longer a
// gate step — the app asks for it on a later visit (see ReviewPrompt).
// accessStatus is checked first since an admin can open/close it independently at any time.
export function GateFlow({ children }: { children: ReactNode }) {
  const { guest, loading, enterGate, refresh, logout } = useAuth();
  const { t } = useLang();

  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [phone, setPhone] = useState('');
  const [channels, setChannels] = useState<ContactChannel[]>([]);
  const [handles, setHandles] = useState<Partial<Record<ContactChannel, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const waiting = guest && guest.accessStatus !== 'open' && guest.statusResidence !== 'rejected';

  useEffect(() => {
    if (!waiting) return;
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [waiting, refresh]);

  if (loading) {
    return (
      <div className="center-screen brand">
        <Compass size={40} style={{ margin: '0 auto 12px', opacity: 0.85 }} />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!guest) {
    const onSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setError('');
      if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone.trim())) {
        setError(t('gate.phoneInvalid'));
        return;
      }
      if (channels.length === 0) {
        setError(t('gate.contactsRequired'));
        return;
      }
      setSubmitting(true);
      try {
        await enterGate({
          name,
          roomNumber: room,
          phone: phone.trim(),
          contacts: channels.map((type) => ({ type, value: (handles[type] ?? '').trim() })),
        });
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t('common.error'));
      } finally {
        setSubmitting(false);
      }
    };

    const toggleChannel = (type: ContactChannel) =>
      setChannels((prev) => (prev.includes(type) ? prev.filter((c) => c !== type) : [...prev, type]));

    const withHandle = CHANNELS.filter((c) => channels.includes(c.type) && !c.phoneBased);

    return (
      <div className="gate-screen">
        <header className="gate-head">
          <div className="gate-head__logo">
            <Compass size={22} strokeWidth={2} />
          </div>
          <div className="gate-head__text">
            <h1>{t('gate.title')}</h1>
            <p>{t('gate.subtitle')}</p>
          </div>
          <LangSwitcher />
        </header>
        <GateSteps current={1} />

        <form onSubmit={onSubmit} className="gate-form">
          <div className="gate-row">
            <label className="gate-field">
              <span>{t('gate.name')}</span>
              <input
                className="gate-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                minLength={2}
              />
            </label>
            <label className="gate-field gate-field--room">
              <span>{t('gate.room')}</span>
              <input className="gate-input" value={room} onChange={(e) => setRoom(e.target.value)} inputMode="numeric" required />
            </label>
          </div>

          <label className="gate-field">
            <span>{t('gate.phone')}</span>
            <div className="gate-input-wrap">
              <Phone size={16} />
              <input
                className="gate-input"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </label>

          <div className="gate-field">
            <span>
              {t('gate.contacts')} <em>· {t('gate.contactsHint')}</em>
            </span>
            <div className="gate-channels">
              {CHANNELS.map((c) => {
                const on = channels.includes(c.type);
                return (
                  <button
                    key={c.type}
                    type="button"
                    className={`gate-channel ${on ? 'on' : ''}`}
                    style={{ ['--ch' as string]: c.color }}
                    onClick={() => toggleChannel(c.type)}
                    aria-pressed={on}
                  >
                    <i>{on ? <Check size={9} strokeWidth={4} /> : null}</i>
                    {c.label || t('gate.contactOther')}
                  </button>
                );
              })}
            </div>
          </div>

          {withHandle.map((c) => (
            <div key={c.type} className="gate-input-wrap gate-handle" style={{ ['--ch' as string]: c.color }}>
              <b>{c.type === 'other' ? t('gate.contactOther') : c.label}</b>
              {c.at && <small>@</small>}
              <input
                className="gate-input"
                value={handles[c.type] ?? ''}
                onChange={(e) => setHandles((prev) => ({ ...prev, [c.type]: e.target.value }))}
                required
                autoCapitalize="none"
                autoCorrect="off"
                placeholder={c.type === 'other' ? t('gate.contactOtherPlaceholder') : t('gate.contactUsername')}
              />
            </div>
          ))}

          {channels.some((type) => CHANNELS.find((c) => c.type === type)?.phoneBased) && (
            <div className="gate-note">{t('gate.contactPhoneBased')}</div>
          )}

          {error && <div className="error-text gate-error">{error}</div>}
          <button className="btn block gate-submit" disabled={submitting} type="submit">
            {t('gate.submit')}
          </button>
        </form>
      </div>
    );
  }

  // Registration steps 2–3 come before everything else, including for guests registered
  // before these steps existed — every guest has to sign the house rules once.
  if (!guest.country || !guest.birthDate) return <ProfileStep />;
  if (!guest.rulesAcceptedAt) return <RulesStep />;

  if (guest.accessStatus === 'open') {
    return <>{children}</>;
  }

  if (guest.statusResidence === 'pending') {
    return (
      <StatusScreen
        icon={<Clock3 />}
        title={t('gate.pending.title')}
        text={t('gate.pending.text')}
        onRefresh={refresh}
        footer={
          <button type="button" className="gate-restart" onClick={logout}>
            {t('gate.restart')}
          </button>
        }
      />
    );
  }

  if (guest.statusResidence === 'rejected') {
    return <StatusScreen icon={<TriangleAlert />} tone="danger" title={t('gate.rejected.title')} text={t('gate.rejected.text')} />;
  }

  // Stay confirmed but access closed by staff.
  return <StatusScreen icon={<Lock />} title={t('gate.accessClosed.title')} text={t('gate.accessClosed.text')} onRefresh={refresh} />;
}

function StatusScreen({
  icon,
  title,
  text,
  onRefresh,
  tone = 'brand',
  footer,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  onRefresh?: () => void;
  tone?: 'brand' | 'danger';
  footer?: ReactNode;
}) {
  const { t } = useLang();
  if (tone === 'danger') {
    return (
      <div className="center-screen">
        <div className="status-icon-badge danger">{icon}</div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    );
  }

  return (
    <div className="center-screen brand">
      <div className="status-icon-badge" style={{ background: 'rgba(255,255,255,0.16)', color: '#fff' }}>
        {icon}
      </div>
      <h1>{title}</h1>
      <p>{text}</p>
      {onRefresh && (
        <button
          className="btn secondary"
          style={{ marginTop: 16, alignSelf: 'center', background: 'rgba(255,255,255,0.14)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
          onClick={onRefresh}
        >
          <RotateCw size={16} /> {t('gate.refresh')}
        </button>
      )}
      {footer}
    </div>
  );
}
