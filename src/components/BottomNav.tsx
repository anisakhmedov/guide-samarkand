import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, MapPin, Compass, MessageCircle, SlidersHorizontal, Bell } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { api } from '../api/client';
import { NotificationsSummary } from '../api/types';

const items = [
  { to: '/', Icon: Home, key: 'nav.home' },
  { to: '/map', Icon: MapPin, key: 'nav.map' },
  { to: '/guide', Icon: Compass, key: 'nav.guide' },
  { to: '/chat', Icon: MessageCircle, key: 'nav.chat' },
  { to: '/options', Icon: SlidersHorizontal, key: 'nav.options' },
];

const POLL_MS = 15000;

export function BottomNav() {
  const { t } = useLang();
  const { pathname } = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = () =>
      api
        .get<NotificationsSummary>('/notifications')
        .then((s) => setUnread(s.unreadChat + s.unseenRequests))
        .catch(() => {});
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const bellActive = pathname.startsWith('/notifications');

  return (
    <nav className="bottom-nav">
      {items.map(({ to, Icon, key }) => {
        const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
        return (
          <NavLink key={to} to={to} end={to === '/'} className={isActive ? 'active' : ''}>
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 26 }}>
              {isActive && (
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
                animate={{ scale: isActive ? 1.12 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                style={{ position: 'relative', display: 'flex' }}
              >
                <Icon />
              </motion.span>
            </span>
            <span>{t(key)}</span>
          </NavLink>
        );
      })}

      <div className="bottom-nav__divider" />
      <NavLink to="/notifications" className={`bottom-nav__bell${bellActive ? ' active' : ''}`} aria-label={t('nav.notifications')}>
        <Bell />
        {unread > 0 && <span className="bottom-nav__bell-badge">{unread > 9 ? '9+' : unread}</span>}
      </NavLink>
    </nav>
  );
}
