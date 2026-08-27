import { CheckCircle2, Clock3, Loader2, MessageSquareText, XCircle, type LucideIcon } from 'lucide-react';
import { API_URL } from '../api/client';
import { ServiceRequest, ServiceRequestType } from '../api/types';
import { useLang } from '../context/LangContext';

const TYPE_LABEL_KEY: Record<ServiceRequestType, string> = {
  food_order: 'options.foodOrder',
  drink_order: 'options.drinksOrder',
  wake_up: 'options.wakeUp',
  cleaning: 'options.cleaning',
  problem: 'options.problem',
  extension: 'options.extension',
};

const STATUS_ICON: Record<string, LucideIcon> = {
  new: Clock3,
  in_progress: Loader2,
  done: CheckCircle2,
  rejected: XCircle,
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  new: '',
  in_progress: 'gold',
  done: 'success',
  rejected: 'danger',
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Full-detail card for one ServiceRequest — used by both the Options "Мои заявки" block
// and the Notifications feed, so a guest sees the same complete information (items
// ordered, time/category/description, and the hotel's comment) in either place.
export function RequestCard({ request }: { request: ServiceRequest }) {
  const { t } = useLang();
  const StatusIcon = STATUS_ICON[request.status] || Clock3;
  const badgeClass = STATUS_BADGE_CLASS[request.status] || '';
  const p = request.payload || {};

  return (
    <div className="card request-card">
      <div className="request-card__head">
        <span className="request-card__icon" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-primary-dark)' }}>
          <StatusIcon size={17} />
        </span>
        <span className="request-card__title">{t(TYPE_LABEL_KEY[request.type])}</span>
        <span className={`badge ${badgeClass}`}>{t(`requestStatus.${request.status}`)}</span>
        {!request.seenByGuest && <span className="notif-item__dot" style={{ top: -2, right: -2 }} />}
      </div>

      <div className="request-card__details">
        {(request.type === 'food_order' || request.type === 'drink_order') && (
          <RequestItemsDetail items={(p.items as { name: string; qty: number; price: number }[]) || []} />
        )}
        {(request.type === 'wake_up' || request.type === 'cleaning') && (
          <>
            <div>
              <strong>{t('requestDetail.time')}:</strong> {(p.time as string) || t('requestDetail.anytime')}
            </div>
            {!!p.note && <div>{p.note as string}</div>}
          </>
        )}
        {request.type === 'extension' && (
          <>
            <div>
              <strong>{t('requestDetail.until')}:</strong> {(p.until as string) || '—'}
            </div>
            {!!p.note && <div>{p.note as string}</div>}
          </>
        )}
        {request.type === 'problem' && (
          <>
            {!!p.category && (
              <div>
                <strong>{t('requestDetail.category')}:</strong> {t(`options.problem.category.${p.category}`)}
              </div>
            )}
            {!!p.description && <div>{p.description as string}</div>}
            {!!p.photo && (
              <img
                src={(p.photo as string).startsWith('http') ? (p.photo as string) : `${API_URL}${p.photo}`}
                alt=""
                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, marginTop: 6 }}
              />
            )}
          </>
        )}
      </div>

      {!!request.adminComment && (
        <div className="request-card__comment">
          <MessageSquareText size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {t('requestDetail.comment')}
            </div>
            {request.adminComment}
          </div>
        </div>
      )}

      <div className="request-card__time">{formatTime(request.createdAt)}</div>
    </div>
  );
}

function RequestItemsDetail({ items }: { items: { name: string; qty: number; price: number }[] }) {
  const { t } = useLang();
  if (items.length === 0) return null;
  const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  return (
    <>
      {items.map((it, i) => (
        <div key={i}>
          {it.name} × {it.qty} — {(it.price * it.qty).toLocaleString()} {t('common.currency')}
        </div>
      ))}
      <div style={{ marginTop: 4 }}>
        <strong>
          {t('requestDetail.total')}: {total.toLocaleString()} {t('common.currency')}
        </strong>
      </div>
    </>
  );
}
