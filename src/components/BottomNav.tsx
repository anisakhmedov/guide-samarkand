import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, MapPin, Compass, SlidersHorizontal } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { api } from '../api/client';
import { NotificationsSummary } from '../api/types';
import { notifyBrowser, requestNotificationPermission } from '../notify';

// Chat and Notifications live inside the Options hub (see OptionsPage) rather than as
// their own tabs — keeps the bar to 4 items and groups every "talk to / hear from the
// hotel" destination in one place.
const items = [
  { to: '/', Icon: Home, key: 'nav.home' },
  { to: '/map', Icon: MapPin, key: 'nav.map' },
  { to: '/guide', Icon: Compass, key: 'nav.guide' },
  { to: '/options', Icon: SlidersHorizontal, key: 'nav.options' },
];

const POLL_MS = 15000;

export function BottomNav() {
  const { t } = useLang();
  const { pathname } = useLocation();
  const [unread, setUnread] = useState(0);
  const prevRef = useRef<NotificationsSummary | null>(null);
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    requestNotificationPermission();

    const load = () =>
      api
        .get<NotificationsSummary>('/notifications')
        .then((s) => {
          setUnread(s.unreadChat + s.unseenRequests);
          const prev = prevRef.current;
          if (prev) {
            if (s.unreadChat > prev.unreadChat) {
              notifyBrowser(tRef.current('notifications.chatTitle'), tRef.current('notifications.newChatBody'));
            }
            if (s.unseenRequests > prev.unseenRequests) {
              notifyBrowser(tRef.current('notifications.title'), tRef.current('notifications.newRequestBody'));
            }
          }
          prevRef.current = s;
        })
        .catch(() => {});
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className="bottom-nav">
      {items.map(({ to, Icon, key }) => {
        const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
        // Chat/Notifications are nested under /options, so the Options tab should also
        // light up (and carry the unread dot) while the guest is on either of them.
        const isOptionsGroup = to === '/options' && (pathname.startsWith('/chat') || pathname.startsWith('/notifications'));
        const active = isActive || isOptionsGroup;
        const showDot = to === '/options' && unread > 0;
        return (
          <NavLink key={to} to={to} end={to === '/'} className={active ? 'active' : ''}>
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 26 }}>
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 999,
                    background: 'var(--color-primary-light)',
                  }}
                />
              )}
              <motion.span
                animate={{ scale: active ? 1.12 : 1, y: active ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                style={{ position: 'relative', display: 'flex' }}
              >
                <Icon />
                {showDot && <span className="bottom-nav__tab-dot" />}
              </motion.span>
            </span>
            <span>{t(key)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
