import { Fragment, FormEvent, ReactNode, useEffect, useState } from 'react';
import { Clock3, Compass, Lock, PenLine, RotateCw, Search, TriangleAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { ApiError } from '../api/client';
import { LangSwitcher } from './LangSwitcher';

// Implements PLAN.md "Полный флоу доступа (двухэтапный гейт)": name+room -> wait for
// residence approval -> leave a review -> wait for review check -> admin opens access.
// accessStatus is checked first since an admin can open/close it independently at any time.
export function GateFlow({ children }: { children: ReactNode }) {
  const { guest, loading, reviewLinks, enterGate, refresh, markReviewSubmitted } = useAuth();
  const { t } = useLang();

  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
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
      setSubmitting(true);
      try {
        await enterGate(name, room);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t('common.error'));
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="center-screen brand">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
          <LangSwitcher />
        </div>

        <Compass size={38} strokeWidth={1.8} style={{ margin: '0 auto 14px', opacity: 0.92 }} />
        <h1 style={{ fontSize: '1.6rem' }}>{t('gate.title')}</h1>
        <p style={{ marginBottom: 26 }}>{t('gate.subtitle')}</p>

        <form onSubmit={onSubmit} className="gate-card">
          <div className="field">
            <label>{t('gate.name')}</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </div>
          <div className="field" style={{ marginBottom: 8 }}>
            <label>{t('gate.room')}</label>
            <input className="input" value={room} onChange={(e) => setRoom(e.target.value)} required />
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="btn block" disabled={submitting} type="submit" style={{ marginTop: 14 }}>
            {t('gate.submit')}
          </button>
        </form>
      </div>
    );
  }

  if (guest.accessStatus === 'open') {
    return <>{children}</>;
  }

  if (guest.statusResidence === 'pending') {
    return (
      <StatusScreen icon={<Clock3 />} title={t('gate.pending.title')} text={t('gate.pending.text')} onRefresh={refresh} step={0} />
    );
  }

  if (guest.statusResidence === 'rejected') {
    return <StatusScreen icon={<TriangleAlert />} tone="danger" title={t('gate.rejected.title')} text={t('gate.rejected.text')} />;
  }

  if (guest.statusReview === 'not_sent') {
    return (
      <div className="center-screen brand">
        <div className="status-icon-badge" style={{ background: 'rgba(255,255,255,0.16)', color: '#fff' }}>
          <PenLine />
        </div>
        <h1>{t('gate.review.title')}</h1>
        <p>{t('gate.review.text')}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {reviewLinks?.google && (
            <a className="btn secondary" href={reviewLinks.google} target="_blank" rel="noreferrer" style={{ background: '#fff' }}>
              Google Maps
            </a>
          )}
          {reviewLinks?.yandex && (
            <a className="btn secondary" href={reviewLinks.yandex} target="_blank" rel="noreferrer" style={{ background: '#fff' }}>
              Яндекс.Карты
            </a>
          )}
          {reviewLinks?.twoGis && (
            <a className="btn secondary" href={reviewLinks.twoGis} target="_blank" rel="noreferrer" style={{ background: '#fff' }}>
              2ГИС
            </a>
          )}
        </div>
        <button
          className="btn block"
          style={{ marginTop: 18, background: '#fff', color: 'var(--color-primary-dark)', boxShadow: 'none' }}
          onClick={() => markReviewSubmitted()}
        >
          {t('gate.review.submit')}
        </button>
        <ProgressSteps step={1} />
      </div>
    );
  }

  if (guest.statusReview === 'pending') {
    return (
      <StatusScreen icon={<Search />} title={t('gate.reviewPending.title')} text={t('gate.reviewPending.text')} onRefresh={refresh} step={1} />
    );
  }

  return <StatusScreen icon={<Lock />} title={t('gate.accessClosed.title')} text={t('gate.accessClosed.text')} onRefresh={refresh} step={2} />;
}

function StatusScreen({
  icon,
  title,
  text,
  onRefresh,
  step,
  tone = 'brand',
}: {
  icon: ReactNode;
  title: string;
  text: string;
  onRefresh?: () => void;
  step?: number;
  tone?: 'brand' | 'danger';
}) {
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
          <RotateCw size={16} /> Обновить
        </button>
      )}
      {step !== undefined && <ProgressSteps step={step} />}
    </div>
  );
}

function ProgressSteps({ step }: { step: number }) {
  const dots = [0, 1, 2];
  return (
    <div className="progress-steps">
      {dots.map((i, idx) => (
        <Fragment key={i}>
          <div className={`progress-steps__dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
          {idx < dots.length - 1 && <div className={`progress-steps__line ${i < step ? 'done' : ''}`} />}
        </Fragment>
      ))}
    </div>
  );
}
