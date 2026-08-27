import { useEffect, useState } from 'react';
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
  MessageCircle,
  Bell,
  ClipboardList,
} from 'lucide-react';
import { api } from '../../api/client';
import { NotificationsSummary, ServiceRequest } from '../../api/types';
import { RequestCard } from '../../components/RequestCard';
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
  const [summary, setSummary] = useState<NotificationsSummary>({ unreadChat: 0, unseenRequests: 0 });
  const [requests, setRequests] = useState<ServiceRequest[] | null>(null);

  useEffect(() => {
    api.get<NotificationsSummary>('/notifications').then(setSummary).catch(() => {});
    api
      .get<ServiceRequest[]>('/service-requests/mine')
      .then((list) => setRequests(list.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))))
      .catch(() => setRequests([]));
  }, []);

  return (
    <motion.div className="page" variants={listVariants} initial="initial" animate="animate">
      <h1>{t('options.title')}</h1>

      <div className="options-grid">
        <motion.div variants={itemVariants}>
          <Link to="/chat" className="card option-tile">
            <span className="option-tile__icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
              <MessageCircle size={21} />
            </span>
            <span className="option-tile__label">{t('nav.chat')}</span>
            {summary.unreadChat > 0 && <span className="option-tile__badge">{summary.unreadChat > 9 ? '9+' : summary.unreadChat}</span>}
          </Link>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Link to="/notifications" className="card option-tile">
            <span className="option-tile__icon" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-primary-dark)' }}>
              <Bell size={21} />
            </span>
            <span className="option-tile__label">{t('nav.notifications')}</span>
            {summary.unseenRequests > 0 && <span className="option-tile__badge">{summary.unseenRequests > 9 ? '9+' : summary.unseenRequests}</span>}
          </Link>
        </motion.div>
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

      <motion.section variants={itemVariants} style={{ marginTop: 8 }}>
        <h2>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClipboardList size={17} color="var(--color-primary)" /> {t('options.myRequests')}
          </span>
        </h2>
        {requests === null && <p className="muted">{t('common.loading')}</p>}
        {requests !== null && requests.length === 0 && <p className="muted">{t('options.myRequests.empty')}</p>}
        {requests?.map((r) => (
          <RequestCard key={r._id} request={r} />
        ))}
      </motion.section>
    </motion.div>
  );
}
