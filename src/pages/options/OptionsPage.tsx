import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  UtensilsCrossed,
  GlassWater,
  AlarmClock,
  Sparkles,
  PenLine,
  MessageSquareWarning,
  CloudSun,
  CalendarClock,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';

const TILES = [
  { to: '/options/food', Icon: UtensilsCrossed, key: 'options.foodOrder', bg: 'var(--color-accent-light)', fg: 'var(--color-accent-dark)' },
  { to: '/options/drinks', Icon: GlassWater, key: 'options.drinksOrder', bg: 'var(--color-gold-light)', fg: 'var(--color-gold-dark)' },
  { to: '/options/wake-up', Icon: AlarmClock, key: 'options.wakeUp', bg: 'var(--color-purple-light)', fg: 'var(--color-purple-dark)' },
  { to: '/options/cleaning', Icon: Sparkles, key: 'options.cleaning', bg: 'var(--color-success-light)', fg: 'var(--color-success)' },
  { to: '/options/review', Icon: PenLine, key: 'options.review', bg: 'var(--color-pink-light)', fg: 'var(--color-pink-dark)' },
  { to: '/options/problem', Icon: MessageSquareWarning, key: 'options.problem', bg: 'var(--color-danger-light)', fg: 'var(--color-danger)' },
  { to: '/options/weather', Icon: CloudSun, key: 'options.weather', bg: 'var(--color-blue-light)', fg: 'var(--color-blue-dark)' },
  { to: '/options/extension', Icon: CalendarClock, key: 'options.extension', bg: 'var(--color-primary-light)', fg: 'var(--color-primary-dark)' },
];

const listVariants: Variants = { animate: { transition: { staggerChildren: 0.05 } } };
const itemVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

export function OptionsPage() {
  const { t } = useLang();

  return (
    <motion.div className="page" variants={listVariants} initial="initial" animate="animate">
      <h1>{t('options.title')}</h1>
      <div className="options-grid">
        {TILES.map(({ to, Icon, key, bg, fg }) => (
          <motion.div key={to} variants={itemVariants}>
            <Link to={to} className="card option-tile">
              <span className="option-tile__icon" style={{ background: bg, color: fg }}>
                <Icon size={21} />
              </span>
              <span className="option-tile__label">{t(key)}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
