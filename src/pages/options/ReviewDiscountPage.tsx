import { useState } from 'react';
import { BadgePercent, CheckCircle2, ExternalLink, Search, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { PageHeader } from '../../components/PageHeader';
import { reviewState, useDiscountPercent, withPercent } from '../../hooks/useReviewOffer';

// Options -> "Оставить отзыв": the same review the in-app prompt asks for — once staff verify
// it, the guest gets the hotel's review discount on room-service food and drinks.
export function ReviewDiscountPage() {
  const { t } = useLang();
  const { guest, reviewLinks, markReviewSubmitted } = useAuth();
  const percent = useDiscountPercent();
  const [submitting, setSubmitting] = useState(false);

  if (!guest) return null;
  const state = reviewState(guest);

  const submit = async () => {
    setSubmitting(true);
    try {
      await markReviewSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  const links = [
    { href: reviewLinks?.google, label: 'Google Maps' },
    { href: reviewLinks?.yandex, label: 'Яндекс.Карты' },
    { href: reviewLinks?.twoGis, label: '2ГИС' },
  ].filter((l) => !!l.href);

  return (
    <div className="page page--narrow">
      <PageHeader title={t('options.review')} />

      {state === 'approved' && (
        <div className="card review-state success">
          <span className="review-state__icon">
            <BadgePercent size={22} />
          </span>
          <div>
            <div className="review-state__title">{withPercent(t('review.approvedTitle'), percent)}</div>
            <div className="muted">{t('review.discountNote')}</div>
          </div>
        </div>
      )}

      {state === 'pending' && (
        <div className="card review-state">
          <span className="review-state__icon">
            <Search size={22} />
          </span>
          <div>
            <div className="review-state__title">{t('review.pendingTitle')}</div>
            <div className="muted">{withPercent(t('review.pendingText'), percent)}</div>
          </div>
        </div>
      )}

      {state === 'not_sent' && (
        <>
          <div className="review-offer card">
            <div className="review-offer__stars" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
            </div>
            {percent !== null && percent > 0 && <span className="review-offer__badge">{withPercent(t('review.badge'), percent)}</span>}
            <p className="review-offer__text">{withPercent(t(percent ? 'review.offer' : 'review.offerNoDiscount'), percent)}</p>
            {percent ? <p className="muted review-offer__note">{t('review.discountNote')}</p> : null}
          </div>

          <div className="review-links">
            {links.map((l) => (
              <a key={l.label} className="btn secondary" href={l.href} target="_blank" rel="noreferrer">
                {l.label} <ExternalLink size={14} />
              </a>
            ))}
          </div>
          <button className="btn block" disabled={submitting} onClick={submit}>
            <CheckCircle2 size={16} /> {t('reviewPrompt.done')}
          </button>
        </>
      )}
    </div>
  );
}
