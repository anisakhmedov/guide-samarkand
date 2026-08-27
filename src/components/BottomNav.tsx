import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, MapPin, Compass, MessageCircle, SlidersHorizontal } from 'lucide-react';
import { useLang } from '../context/LangContext';

const items = [
  { to: '/', Icon: Home, key: 'nav.home' },
  { to: '/map', Icon: MapPin, key: 'nav.map' },
  { to: '/guide', Icon: Compass, key: 'nav.guide' },
  { to: '/chat', Icon: MessageCircle, key: 'nav.chat' },
  { to: '/options', Icon: SlidersHorizontal, key: 'nav.options' },
];

export function BottomNav() {
  const { t } = useLang();
  const { pathname } = useLocation();

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
    </nav>
  );
}
