import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, MapPin, Compass, SlidersHorizontal } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useNotifications } from '../context/NotificationsContext';

// Chat and Notifications live inside the Options hub (see OptionsPage) rather than as
// their own tabs — keeps the bar to 4 items and groups every "talk to / hear from the
// hotel" destination in one place.
// Options is the landing page ("/") for now; Home/Map/Guide open a "coming soon" screen.
const items = [
  { to: '/home', Icon: Home, key: 'nav.home', soon: true },
  { to: '/map', Icon: MapPin, key: 'nav.map', soon: true },
  { to: '/guide', Icon: Compass, key: 'nav.guide', soon: true },
  { to: '/', Icon: SlidersHorizontal, key: 'nav.options', soon: false },
];

const OPTIONS_PATHS = ['/options', '/chat', '/notifications', '/profile'];

export function BottomNav() {
  const { t } = useLang();
  const { pathname } = useLocation();
  const { total: unread } = useNotifications();

  return (
    <nav className="bottom-nav">
      {items.map(({ to, Icon, key, soon }) => {
        const isOptionsTab = to === '/';
        const active = isOptionsTab
          ? pathname === '/' || OPTIONS_PATHS.some((p) => pathname.startsWith(p))
          : pathname.startsWith(to) || (to === '/home' && (pathname.startsWith('/place') || pathname.startsWith('/history')));
        const showDot = isOptionsTab && unread > 0;
        return (
          <NavLink key={to} to={to} end={to === '/'} className={`${active ? 'active' : ''} ${soon ? 'is-soon' : ''}`}>
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
            {soon && <span className="bottom-nav__soon">{t('soon.short')}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}
