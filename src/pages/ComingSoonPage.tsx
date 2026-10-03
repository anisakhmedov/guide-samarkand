import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home, MapPin, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useLang } from '../context/LangContext';

export type ComingSoonSection = 'home' | 'map' | 'guide';

const ICONS: Record<ComingSoonSection, ReactNode> = {
  home: <Home size={30} />,
  map: <MapPin size={30} />,
  guide: <Compass size={30} />,
};

// Placeholder for sections that aren't launched yet (Home feed, Map, Guide/routes).
// The Options hub is the app's landing page meanwhile.
export function ComingSoonPage({ section }: { section: ComingSoonSection }) {
  const { t } = useLang();
  return (
    <div className="page soon-page">
      <motion.div
        className="soon-card"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="soon-card__icon">
          {ICONS[section]}
          <span className="soon-card__spark">
            <Sparkles size={14} />
          </span>
        </div>
        <span className="soon-card__badge">{t('soon.badge')}</span>
        <h1>{t(`nav.${section}`)}</h1>
        <p>{t('soon.text')}</p>
        <Link to="/" className="btn block">
          <SlidersHorizontal size={16} /> {t('soon.toOptions')}
        </Link>
      </motion.div>
    </div>
  );
}
