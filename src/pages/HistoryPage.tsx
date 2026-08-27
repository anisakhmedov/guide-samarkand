import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { ArrowLeft, Landmark, MapPin } from 'lucide-react';
import { api, API_URL } from '../api/client';
import { Place } from '../api/types';
import { IllustrationPattern } from '../components/IllustrationPattern';

const listVariants: Variants = { animate: { transition: { staggerChildren: 0.09 } } };
const itemVariants: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } },
};

const seedPalette: [string, string][] = [
  ['var(--color-primary)', 'var(--color-primary-dark)'],
  ['var(--color-accent)', 'var(--color-accent-dark)'],
  ['var(--color-purple)', 'var(--color-purple-dark)'],
  ['var(--color-gold)', 'var(--color-gold-dark)'],
  ['var(--color-blue)', 'var(--color-blue-dark)'],
  ['var(--color-pink)', 'var(--color-pink-dark)'],
];

// A curated "living history" reading experience built from the guide's attraction places —
// each landmark gets an illustrated story card with a teaser and its location, and opens
// into the enhanced "story mode" of PlacePage (see PlacePage.tsx isStory branch).
export function HistoryPage() {
  const [places, setPlaces] = useState<Place[] | null>(null);

  useEffect(() => {
    api
      .get<Place[]>('/places?category=attraction')
      .then(setPlaces)
      .catch(() => setPlaces([]));
  }, []);

  return (
    <div className="page" style={{ paddingBottom: 90 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <Link to="/" className="icon-btn" style={{ background: 'var(--color-primary-light)', border: 'none', color: 'var(--color-primary-dark)' }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 style={{ margin: 0 }}>История Самарканда</h1>
      </div>
      <p style={{ marginBottom: 20 }}>Легенды и судьбы древних мест — листайте истории и открывайте, где их найти на карте.</p>

      {places === null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 168, borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      )}

      {places !== null && places.length === 0 && (
        <div className="empty-state">
          <div className="icon-wrap">
            <Landmark size={26} />
          </div>
          <p>Пока нет исторических мест в гайде.</p>
        </div>
      )}

      <motion.div variants={listVariants} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {places?.map((place, i) => {
          const [color, colorDark] = seedPalette[i % seedPalette.length];
          const photo = place.photos[0];
          const teaser = place.description.length > 150 ? `${place.description.slice(0, 150).trim()}…` : place.description;

          return (
            <motion.div key={place._id} variants={itemVariants}>
              <Link to={`/place/${place._id}`} className="story-card">
                <div className="story-card__media">
                  {photo ? (
                    <img src={photo.startsWith('http') ? photo : `${API_URL}${photo}`} alt={place.name} />
                  ) : (
                    <IllustrationPattern color={color} colorDark={colorDark} seed={i} icon={<Landmark size={34} strokeWidth={1.4} />} />
                  )}
                  <div className="story-card__media-fade" />
                  <div className="story-card__title-on-media">{place.name}</div>
                </div>
                <div className="story-card__body">
                  <p className="story-card__teaser">{teaser}</p>
                  <div className="story-card__loc">
                    <MapPin size={13} /> {place.district || 'Самарканд'}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
