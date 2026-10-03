import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, MessageCircle, X } from 'lucide-react';
import { api } from '../api/client';
import { NotificationsSummary } from '../api/types';
import { initNotifications, notificationPermission, notify, NotifyPermission, requestNotificationPermission } from '../notify';
import { useLang } from './LangContext';

const POLL_MS = 10000;
const TOAST_MS = 6000;

interface Toast {
  id: number;
  kind: 'chat' | 'request';
  title: string;
  body: string;
  url: string;
}

interface NotificationsContextValue {
  summary: NotificationsSummary;
  total: number;
  refresh: () => void;
  permission: NotifyPermission;
  enable: () => Promise<void>;
}

const EMPTY: NotificationsSummary = { unreadChat: 0, unseenRequests: 0 };
const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

// One poller for the whole guest app (badges on the tab bar + Options tiles, in-app toasts,
// and system notifications), mounted above the routes so it survives page changes —
// including the full-screen chat, which hides the tab bar.
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [summary, setSummary] = useState<NotificationsSummary>(EMPTY);
  const [permission, setPermission] = useState<NotifyPermission>(notificationPermission);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const prevRef = useRef<NotificationsSummary | null>(null);
  const pathRef = useRef(pathname);
  const tRef = useRef(t);
  pathRef.current = pathname;
  tRef.current = t;

  const pushToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.filter((x) => x.kind !== toast.kind), { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), TOAST_MS);
  };

  const load = useCallback(
    () =>
      api
        .get<NotificationsSummary>('/notifications')
        .then((s) => {
          const prev = prevRef.current;
          prevRef.current = s;
          setSummary(s);
          if (!prev) return;
          const tr = tRef.current;
          const path = pathRef.current;
          if (s.unreadChat > prev.unreadChat) {
            const n = { title: tr('notifications.chatTitle'), body: tr('notifications.newChatBody'), url: '/chat' };
            notify({ ...n, tag: 'guest-chat' });
            if (path !== '/chat') pushToast({ kind: 'chat', ...n });
          }
          if (s.unseenRequests > prev.unseenRequests) {
            const n = { title: tr('notifications.title'), body: tr('notifications.newRequestBody'), url: '/notifications' };
            notify({ ...n, tag: 'guest-request' });
            if (path !== '/notifications') pushToast({ kind: 'request', ...n });
          }
        })
        .catch(() => {}),
    [],
  );

  useEffect(() => initNotifications((url) => navigate(url)), []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    // Catch up right away when the guest comes back to the tab.
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  // Opening a section is "reading" it — drop its toast.
  useEffect(() => {
    setToasts((prev) => prev.filter((x) => x.url !== pathname));
  }, [pathname]);

  const enable = async () => setPermission(await requestNotificationPermission());

  return (
    <NotificationsContext.Provider
      value={{ summary, total: summary.unreadChat + summary.unseenRequests, refresh: load, permission, enable }}
    >
      {children}
      {createPortal(
        <div className="toast-stack" aria-live="polite">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                className="toast"
                initial={{ opacity: 0, y: -24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  setToasts((prev) => prev.filter((x) => x.id !== toast.id));
                  navigate(toast.url);
                }}
              >
                <span className={`toast__icon ${toast.kind}`}>{toast.kind === 'chat' ? <MessageCircle size={18} /> : <Bell size={18} />}</span>
                <span className="toast__text">
                  <span className="toast__title">{toast.title}</span>
                  <span className="toast__body">{toast.body}</span>
                </span>
                <button
                  type="button"
                  className="toast__close"
                  aria-label="Close"
                  onClick={(e) => {
                    e.stopPropagation();
                    setToasts((prev) => prev.filter((x) => x.id !== toast.id));
                  }}
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
