import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellRing, CheckCircle2, ChevronDown, Clock3, Loader2, MessageCircle, XCircle, type LucideIcon } from 'lucide-react';
import { api } from '../api/client';
import { ChatMessage, ServiceRequest, ServiceRequestType } from '../api/types';
import { RequestCard } from '../components/RequestCard';
import { PageHeader } from '../components/PageHeader';
import { useLang } from '../context/LangContext';
import { useNotifications } from '../context/NotificationsContext';

const TYPE_LABEL_KEY: Record<ServiceRequestType, string> = {
  food_order: 'options.foodOrder',
  drink_order: 'options.drinksOrder',
  hookah: 'options.hookah',
  wake_up: 'options.wakeUp',
  cleaning: 'options.cleaning',
  problem: 'options.problem',
  extension: 'options.extension',
};

const STATUS_STYLE: Record<string, { Icon: LucideIcon; bg: string; fg: string; badge: string }> = {
  new: { Icon: Clock3, bg: 'var(--color-surface-alt)', fg: 'var(--color-text-muted)', badge: '' },
  in_progress: { Icon: Loader2, bg: 'var(--color-gold-light)', fg: 'var(--color-gold-dark)', badge: 'gold' },
  done: { Icon: CheckCircle2, bg: 'var(--color-success-light)', fg: 'var(--color-success)', badge: 'success' },
  rejected: { Icon: XCircle, bg: 'var(--color-danger-light)', fg: 'var(--color-danger)', badge: 'danger' },
};

const LOCALES: Record<string, string> = { ru: 'ru-RU', en: 'en-GB', uz: 'uz-UZ' };

interface FeedItem {
  key: string;
  time: Date;
  unread: boolean;
  chat?: { last: ChatMessage; unreadCount: number };
  request?: ServiceRequest;
}

export function NotificationPermissionBanner() {
  const { t } = useLang();
  const { permission, enable } = useNotifications();
  if (permission === 'granted' || permission === 'unsupported') return null;
  return (
    <div className={`card notif-permission ${permission === 'denied' ? 'denied' : ''}`}>
      <span className="notif-permission__icon">
        <BellRing size={20} />
      </span>
      <div className="notif-permission__text">
        <div className="notif-permission__title">{t('notifications.enableTitle')}</div>
        <div className="notif-permission__body">{permission === 'denied' ? t('notifications.denied') : t('notifications.enableText')}</div>
      </div>
      {permission === 'default' && (
        <button type="button" className="btn sm" onClick={enable}>
          {t('notifications.enableButton')}
        </button>
      )}
    </div>
  );
}

// Activity feed: hotel chat replies + status changes of the guest's Options requests.
// Opening the page counts as reading it — unseen requests are marked seen automatically
// (they stay highlighted until the guest leaves, so it's clear what was new).
export function NotificationsPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { refresh } = useNotifications();
  const [items, setItems] = useState<FeedItem[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const markedRef = useRef(false);
  const locale = LOCALES[lang] || 'ru-RU';

  useEffect(() => {
    Promise.all([
      api.get<ServiceRequest[]>('/service-requests/mine').catch(() => [] as ServiceRequest[]),
      api.get<ChatMessage[]>('/chat/messages').catch(() => [] as ChatMessage[]),
    ]).then(([requests, messages]) => {
      const feed: FeedItem[] = requests.map((r) => ({
        key: r._id,
        time: new Date(r.updatedAt || r.createdAt),
        unread: !r.seenByGuest,
        request: r,
      }));
      const fromHotel = messages.filter((m) => m.sender === 'admin');
      if (fromHotel.length) {
        const last = fromHotel[fromHotel.length - 1];
        const unreadCount = fromHotel.filter((m) => !m.readStatus).length;
        feed.push({ key: 'chat', time: new Date(last.timestamp), unread: unreadCount > 0, chat: { last, unreadCount } });
      }
      feed.sort((a, b) => +b.time - +a.time);
      setItems(feed);

      if (!markedRef.current && requests.some((r) => !r.seenByGuest)) {
        markedRef.current = true;
        setTimeout(() => api.patch('/service-requests/mark-seen').then(refresh).catch(() => {}), 1200);
      }
    });
  }, []);

  const formatTime = (d: Date) => {
    const now = new Date();
    return d.toDateString() === now.toDateString()
      ? d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  };

  const renderItem = (item: FeedItem) => {
    if (item.chat) {
      const { last, unreadCount } = item.chat;
      return (
        <button key={item.key} type="button" className={`notif-card ${item.unread ? 'unread' : ''}`} onClick={() => navigate('/chat')}>
          <span className="notif-card__icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
            <MessageCircle size={19} />
          </span>
          <span className="notif-card__body">
            <span className="notif-card__top">
              <span className="notif-card__title">{t('notifications.chatTitle')}</span>
              <span className="notif-card__time">{formatTime(item.time)}</span>
            </span>
            <span className="notif-card__text">{last.text || `📷 ${t('chat.photo')}`}</span>
            {unreadCount > 1 && (
              <span className="notif-card__meta">
                <span className="badge">
                  {t('notifications.moreMessages')}: {unreadCount - 1}
                </span>
              </span>
            )}
          </span>
        </button>
      );
    }

    const r = item.request!;
    const style = STATUS_STYLE[r.status] || STATUS_STYLE.new;
    const open = expanded === r._id;
    return (
      <div key={item.key} className="notif-group">
        <button type="button" className={`notif-card ${item.unread ? 'unread' : ''}`} onClick={() => setExpanded(open ? null : r._id)}>
          <span className="notif-card__icon" style={{ background: style.bg, color: style.fg }}>
            <style.Icon size={19} />
          </span>
          <span className="notif-card__body">
            <span className="notif-card__top">
              <span className="notif-card__title">{t(TYPE_LABEL_KEY[r.type])}</span>
              <span className="notif-card__time">{formatTime(item.time)}</span>
            </span>
            <span className="notif-card__text">
              {r.adminComment ? `«${r.adminComment}»` : `${t('notifications.requestStatus')}: ${t(`requestStatus.${r.status}`)}`}
            </span>
            <span className="notif-card__meta">
              <span className={`badge ${style.badge}`}>{t(`requestStatus.${r.status}`)}</span>
              <span className="notif-card__more">
                {open ? t('notifications.hide') : t('notifications.details')}
                <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </span>
            </span>
          </span>
        </button>
        {open && <RequestCard request={{ ...r, seenByGuest: true }} />}
      </div>
    );
  };

  const fresh = items?.filter((i) => i.unread) ?? [];
  const earlier = items?.filter((i) => !i.unread) ?? [];

  return (
    <div className="page page--narrow">
      <PageHeader title={t('notifications.title')} />
      <NotificationPermissionBanner />

      {items === null && <p className="muted">{t('common.loading')}</p>}

      {items !== null && items.length === 0 && (
        <div className="empty-state">
          <div className="icon-wrap">
            <Bell size={24} />
          </div>
          <p>{t('notifications.empty')}</p>
        </div>
      )}

      {fresh.length > 0 && (
        <>
          <div className="notif-section">{t('notifications.new')}</div>
          {fresh.map(renderItem)}
        </>
      )}
      {earlier.length > 0 && (
        <>
          {fresh.length > 0 && <div className="notif-section">{t('notifications.earlier')}</div>}
          {earlier.map(renderItem)}
        </>
      )}
    </div>
  );
}
