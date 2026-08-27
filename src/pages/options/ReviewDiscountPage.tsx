import { useEffect, useState } from 'react';
import { CheckCircle2, Percent, Search } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';

export function ReviewDiscountPage() {
  const { t } = useLang();
  const { guest, reviewLinks, submitDiscountReview } = useAuth();
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get<{ discountPercent: number }>('/settings/discount')
      .then((res) => setDiscountPercent(res.discountPercent))
      .catch(() => {});
  }, []);

  if (!guest) return null;

  const submit = async () => {
    setSubmitting(true);
    try {
      await submitDiscountReview();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h1>{t('options.review')}</h1>

      {guest.discountStatus === 'approved' && (
        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="status-icon-badge" style={{ width: 44, height: 44, margin: 0, background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <Percent size={20} />
          </div>
          <span>
            {discountPercent ?? ''}% {t('options.review.approvedSuffix')}
          </span>
        </div>
      )}

      {guest.discountStatus === 'pending' && (
        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="status-icon-badge" style={{ width: 44, height: 44, margin: 0 }}>
            <Search size={20} />
          </div>
          <span>{t('options.review.pending')}</span>
        </div>
      )}

      {guest.discountStatus === 'none' && (
        <>
          <p>{t('options.review.subtitle')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {reviewLinks?.google && (
              <a className="btn secondary" href={reviewLinks.google} target="_blank" rel="noreferrer">
                Google Maps
              </a>
            )}
            {reviewLinks?.yandex && (
              <a className="btn secondary" href={reviewLinks.yandex} target="_blank" rel="noreferrer">
                Яндекс.Карты
              </a>
            )}
            {reviewLinks?.twoGis && (
              <a className="btn secondary" href={reviewLinks.twoGis} target="_blank" rel="noreferrer">
                2ГИС
              </a>
            )}
          </div>
          <button className="btn block" disabled={submitting} onClick={submit}>
            <CheckCircle2 size={16} /> {t('options.review.submit')}
          </button>
        </>
      )}
    </div>
  );
}
