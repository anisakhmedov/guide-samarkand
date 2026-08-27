import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { User, Sparkles, UtensilsCrossed, Coffee, Landmark, ConciergeBell, BookOpenText, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { Place, PlaceCategory } from '../api/types';
import { PlaceCard, PlaceCardSkeleton } from '../components/PlaceCard';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { LangSwitcher } from '../components/LangSwitcher';
import { categoryColor } from '../theme';

const CATEGORIES: { code: PlaceCategory; Icon: typeof UtensilsCrossed }[] = [
  { code: 'restaurant', Icon: UtensilsCrossed },
  { code: 'cafe', Icon: Coffee },
  { code: 'attraction', Icon: Landmark },
  { code: 'service', Icon: ConciergeBell },
];

function greeting(hour: number) {
  if (hour < 5) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

const listVariants: Variants = {
  animate: { transition: { staggerChildren: 0.08 } },
};
const itemVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
};

export function HomePage() {
  const { guest } = useAuth();
  const { t } = useLang();
  const [places, setPlaces] = useState<Place[] | null>(null);

  useEffect(() => {
    api
      .get<Place[]>('/places')
      .then(setPlaces)
      .catch(() => setPlaces([]));
  }, []);

  const recommended = places?.filter((p) => p.recommendedByHotel) || [];

  return (
    <div>
      <div className="top-hero">
        <div className="top-hero__row">
          <div className="top-hero__text">
            <div className="top-hero__hotel">
              <Landmark size={13} /> Отель — куратор гида
            </div>
            <div className="top-hero__greeting" title={`${greeting(new Date().getHours())}, ${guest?.name}!`}>
              {greeting(new Date().getHours())}, {guest?.name}!
            </div>
            <div className="top-hero__sub">Вот что советует отель в Самарканде сегодня</div>
          </div>
          <div className="top-hero__side">
            <Link to="/profile" className="icon-btn">
              <User size={18} />
            </Link>
            <LangSwitcher />
          </div>
        </div>
      </div>

      <motion.div className="page" variants={listVariants} initial="initial" animate="animate">
        <motion.div variants={itemVariants}>
          <Link to="/history" className="history-banner">
            <div className="history-banner__icon">
              <BookOpenText size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="history-banner__title">Живая история Самарканда</div>
              <div className="history-banner__sub">Легенды древних мест, которые стоит услышать</div>
            </div>
            <ArrowRight size={20} />
          </Link>
        </motion.div>

        {places === null && (
          <motion.section variants={itemVariants}>
            <div className="skeleton skeleton-line" style={{ width: 140, height: 18 }} />
            <div className="hscroll">
              {[1, 2, 3].map((i) => (
                <PlaceCardSkeleton key={i} />
              ))}
            </div>
          </motion.section>
        )}

        {recommended.length > 0 && (
          <motion.section variants={itemVariants}>
            <h2>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={17} color="var(--color-gold)" /> Рекомендует отель
              </span>
            </h2>
            <div className="hscroll">
              {recommended.map((p) => (
                <PlaceCard key={p._id} place={p} />
              ))}
            </div>
          </motion.section>
        )}

        {places !== null &&
          CATEGORIES.map(({ code, Icon }) => {
            const items = places.filter((p) => p.category === code);
            if (items.length === 0) return null;
            return (
              <motion.section key={code} variants={itemVariants}>
                <h2>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon size={17} color={categoryColor[code]} /> {t(`home.categories.${code}`)}
                  </span>
                </h2>
                <div className="hscroll">
                  {items.map((p) => (
                    <PlaceCard key={p._id} place={p} />
                  ))}
                </div>
              </motion.section>
            );
          })}

        {places !== null && places.length === 0 && (
          <div className="empty-state">
            <div className="icon-wrap">
              <Landmark size={26} />
            </div>
            <p>Пока в гайде нет мест — загляните позже.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
