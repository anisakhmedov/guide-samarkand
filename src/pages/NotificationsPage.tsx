import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, Clock3, Loader2, MessageCircle, XCircle, type LucideIcon } from 'lucide-react';
import { api } from '../api/client';
import { ChatMessage, ServiceRequest, ServiceRequestType } from '../api/types';
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

// Combined feed for the bottom-nav bell: the hotel's latest chat reply + status updates
// on everything the guest sent from Options (food/drink orders, wake-up, cleaning,
// problem reports, extension requests). Opening this page marks both as seen.
export function NotificationsPage() {
  const { t } = useLang();
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[] | null>(null);

  useEffect(() => {
    api.get<ChatMessage[]>('/chat/messages').then(setMessages).catch(() => setMessages([]));
    api
      .get<ServiceRequest[]>('/service-requests/mine')
      .then(setRequests)
      .catch(() => setRequests([]));
    api.patch('/chat/messages/read').catch(() => {});
    api.patch('/service-requests/mark-seen').catch(() => {});
  }, []);

  const loading = messages === null || requests === null;
  const lastAdminMessage = messages
    ?.slice()
    .reverse()
    .find((m) => m.sender === 'admin');
  const hasUnreadChat = messages?.some((m) => m.sender === 'admin' && !m.readStatus) ?? false;
  const sortedRequests = requests?.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)) ?? [];
  const empty = !loading && !lastAdminMessage && sortedRequests.length === 0;

  return (
    <div className="page">
      <h1>{t('notifications.title')}</h1>

      {loading && <p className="muted">{t('common.loading')}</p>}

      {!loading && (
        <>
          {lastAdminMessage && (
            <Link to="/chat" className="card notif-item">
              <div className="notif-item__icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
                <MessageCircle size={18} />
              </div>
              <div className="notif-item__body">
                <div className="notif-item__title">{t('notifications.chatTitle')}</div>
                <div className="notif-item__preview">{lastAdminMessage.text || t('notifications.photo')}</div>
              </div>
              <div className="notif-item__time">{formatTime(lastAdminMessage.timestamp)}</div>
              {hasUnreadChat && <span className="notif-item__dot" />}
            </Link>
          )}

          {sortedRequests.map((r) => {
            const StatusIcon = STATUS_ICON[r.status] || Clock3;
            const badgeClass = STATUS_BADGE_CLASS[r.status] || '';
            return (
              <div key={r._id} className="card notif-item">
                <div className="notif-item__icon" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-primary-dark)' }}>
                  <StatusIcon size={18} />
                </div>
                <div className="notif-item__body">
                  <div className="notif-item__title">{t(TYPE_LABEL_KEY[r.type])}</div>
                  <div className="notif-item__preview">{formatTime(r.createdAt)}</div>
                </div>
                <span className={`badge ${badgeClass}`}>{t(`requestStatus.${r.status}`)}</span>
                {!r.seenByGuest && <span className="notif-item__dot" />}
              </div>
            );
          })}

          {empty && (
            <div className="empty-state">
              <div className="icon-wrap">
                <Bell size={24} />
              </div>
              <p>{t('notifications.empty')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
