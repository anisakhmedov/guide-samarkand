import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  Clock3,
  Footprints,
  Car,
  Landmark,
  UtensilsCrossed,
  Baby,
  Moon,
  Camera,
  Route as RouteIcon,
  MapPin,
  Plus,
  Compass,
} from 'lucide-react';
import { api } from '../api/client';
import { GuideRoute, RouteDuration, RouteTheme, TransportType } from '../api/types';
import { useLang } from '../context/LangContext';
import { themeColor, themeColorDark, themeColorLight } from '../theme';

const THEMES: RouteTheme[] = ['history', 'food', 'kids', 'evening', 'photo'];
const DURATIONS: RouteDuration[] = ['short', 'half_day', 'full_day'];
const TRANSPORTS: TransportType[] = ['walking', 'transport'];

const themeIcon: Record<RouteTheme, typeof Landmark> = {
  history: Landmark,
  food: UtensilsCrossed,
  kids: Baby,
  evening: Moon,
  photo: Camera,
};

const themeBadgeClass: Record<RouteTheme, string> = {
  history: '',
  food: 'accent',
  kids: 'pink',
  evening: 'purple',
  photo: 'blue',
};

const transportIcon: Record<TransportType, typeof Footprints> = {
  walking: Footprints,
  transport: Car,
};

const listVariants: Variants = { animate: { transition: { staggerChildren: 0.07 } } };
const itemVariants: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

export function GuidePage() {
  const { t } = useLang();
  const [routes, setRoutes] = useState<GuideRoute[]>([]);
  const [theme, setTheme] = useState<RouteTheme | null>(null);
  const [duration, setDuration] = useState<RouteDuration | null>(null);
  const [transport, setTransport] = useState<TransportType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (theme) params.set('theme', theme);
    if (duration) params.set('duration', duration);
    if (transport) params.set('transport', transport);
    api
      .get<GuideRoute[]>(`/routes?${params.toString()}`)
      .then(setRoutes)
      .catch(() => setRoutes([]))
      .finally(() => setLoading(false));
  }, [theme, duration, transport]);

  return (
    <div className="page" style={{ paddingBottom: 90 }}>
      <h1>{t('nav.guide')}</h1>

      <div className="muted" style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
        {t('guide.filters.duration')}
      </div>
      <div className="chip-row">
        {DURATIONS.map((d) => (
          <span key={d} className={`chip ${duration === d ? 'active' : ''}`} onClick={() => setDuration(duration === d ? null : d)}>
            <Clock3 /> {t(`guide.duration.${d}`)}
          </span>
        ))}
      </div>

      <div className="muted" style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
        {t('guide.filters.theme')}
      </div>
      <div className="chip-row">
        {THEMES.map((th) => {
          const Icon = themeIcon[th];
          const isActive = theme === th;
          return (
            <span
              key={th}
              className={`chip ${isActive ? 'active' : ''}`}
              style={isActive ? { background: themeColor[th], borderColor: themeColor[th] } : undefined}
              onClick={() => setTheme(theme === th ? null : th)}
            >
              <Icon /> {t(`guide.theme.${th}`)}
            </span>
          );
        })}
      </div>

      <div className="muted" style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
        {t('guide.filters.transport')}
      </div>
      <div className="chip-row">
        {TRANSPORTS.map((tr) => {
          const Icon = transportIcon[tr];
          return (
            <span key={tr} className={`chip ${transport === tr ? 'active' : ''}`} onClick={() => setTransport(transport === tr ? null : tr)}>
              <Icon /> {t(`guide.transport.${tr}`)}
            </span>
          );
        })}
      </div>

      <Link to="/guide/build" className="btn block" style={{ margin: '16px 0' }}>
        <Plus size={17} /> {t('guide.buildOwn')}
      </Link>

      {loading &&
        [1, 2].map((i) => (
          <div key={i} className="card route-card">
            <div className="skeleton skeleton-line" style={{ width: '60%', height: 18 }} />
            <div className="skeleton skeleton-line" style={{ width: '40%' }} />
          </div>
        ))}

      {!loading && routes.length === 0 && (
        <div className="empty-state">
          <div className="icon-wrap">
            <Compass size={26} />
          </div>
          <p>{t('guide.empty')}</p>
        </div>
      )}

      <motion.div variants={listVariants} initial="initial" animate="animate">
        {routes.map((r) => {
          const ThemeIcon = r.theme ? themeIcon[r.theme] : Compass;
          const TransportIconC = transportIcon[r.transportType];
          const rTheme = r.theme;
          return (
            <motion.div key={r._id} variants={itemVariants} whileTap={{ scale: 0.98 }}>
              <Link to={`/guide/route/${r._id}`} className="card route-card">
                <div className="route-card__top">
                  <div>
                    <div className="route-card__title">{r.title}</div>
                    <div className="chip-row" style={{ margin: 0 }}>
                      {rTheme && <span className={`badge ${themeBadgeClass[rTheme]}`}>{t(`guide.theme.${rTheme}`)}</span>}
                      <span className="badge">{t(`guide.duration.${r.durationEstimate}`)}</span>
                    </div>
                  </div>
                  <div
                    className="route-card__theme-icon"
                    style={rTheme ? { background: themeColorLight[rTheme], color: themeColorDark[rTheme] } : undefined}
                  >
                    <ThemeIcon size={19} />
                  </div>
                </div>
                <div className="route-card__meta">
                  <span>
                    <MapPin /> {r.points.length} {t('route.points')}
                  </span>
                  <span>
                    <RouteIcon /> {(r.totalDistanceMeters / 1000).toFixed(1)} км
                  </span>
                  <span>
                    <Clock3 /> ~{r.totalDurationMinutes} мин
                  </span>
                  <span>
                    <TransportIconC /> {t(`guide.transport.${r.transportType}`)}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
