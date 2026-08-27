import { ReactNode, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { useLang } from '../context/LangContext';
import { ServiceRequestType } from '../api/types';

interface RequestFormProps {
  type: ServiceRequestType;
  title: string;
  subtitle: string;
  payload: Record<string, unknown>;
  disabled?: boolean;
  children: ReactNode;
  onSentReset?: () => void;
}

// Shared submit/success shell for the simple Options request forms (wake-up, cleaning,
// problem report, extension) — mirrors the submit/success pattern already used for the
// app-feedback box on ProfilePage.tsx.
export function RequestForm({ type, title, subtitle, payload, disabled, children, onSentReset }: RequestFormProps) {
  const { t } = useLang();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post('/service-requests', { type, payload });
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="page">
        <h1>{title}</h1>
        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <CheckCircle2 size={22} color="var(--color-success)" />
          <span>{t('options.form.sent')}</span>
        </div>
        <button
          className="btn secondary block"
          style={{ marginTop: 12 }}
          onClick={() => {
            setSent(false);
            onSentReset?.();
          }}
        >
          {t('options.form.sendAnother')}
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
      <button className="btn block" style={{ marginTop: 10 }} disabled={submitting || disabled} onClick={submit}>
        {t('options.form.submit')}
      </button>
    </div>
  );
}
