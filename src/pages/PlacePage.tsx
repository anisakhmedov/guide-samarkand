import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpenText, Clock, Landmark, ListTree, MapPin, Star } from 'lucide-react';
import { api, API_URL } from '../api/client';
import { Place } from '../api/types';
import { useLang } from '../context/LangContext';
import { IllustrationPattern } from '../components/IllustrationPattern';

// Friendly labels for the well-known extra-field keys used in the seed data / admin form
// (PLAN.md "доп. поля по типу категории"); anything else falls back to the raw key.
const EXTRA_FIELD_LABEL: Record<string, string> = {
  ticketPrice: 'Билет',
  visitDuration: 'Время на посещение',
  cuisine: 'Кухня',
  priceRange: 'Ценовой сегмент',
  serviceType: 'Вид услуги',
};

export function PlacePage() {
  const { id } = useParams();
  const { t } = useLang();
  const [place, setPlace] = useState<Place | null>(null);

  useEffect(() => {
    if (id) api.get<Place>(`/places/${id}`).then(setPlace).catch(() => setPlace(null));
  }, [id]);

  if (!place) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton skeleton-line" style={{ width: '70%', height: 22, marginTop: 18 }} />
        <div className="skeleton skeleton-line" style={{ width: '40%' }} />
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${place.location.lat},${place.location.lng}`;
  // "Story mode": attractions get an editorial treatment (illustrated hero when no photo,
  // drop-cap opening, a nod back to the History collection) — see PLAN.md follow-up request.
  const isStory = place.category === 'attraction';

  return (
    <div>
      <div style={{ position: 'relative' }}>
        {place.photos.length > 0 ? (
          <div className="gallery">
            {place.photos.map((p, i) => (
              <img key={i} src={p.startsWith('http') ? p : `${API_URL}${p}`} alt={place.name} />
            ))}
          </div>
        ) : isStory ? (
          <div style={{ height: 220, borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
            <IllustrationPattern
              color="var(--color-accent)"
              colorDark="var(--color-primary-dark)"
              seed={place._id.charCodeAt(0)}
              icon={<Landmark size={44} strokeWidth={1.3} />}
            />
          </div>
        ) : (
          <div className="photo-placeholder">
            <MapPin size={38} strokeWidth={1.4} />
          </div>
        )}
        <Link to="/" className="icon-btn" style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(28,26,23,0.45)', border: 'none' }}>
          <ArrowLeft size={18} />
        </Link>
      </div>

      <motion.div
        className="page"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 style={{ marginTop: 6 }}>{place.name}</h1>
        <div className="chip-row" style={{ marginTop: -6 }}>
          <span className="badge">{t(`home.categories.${place.category}`)}</span>
          {place.recommendedByHotel && (
            <span className="badge gold">
              <Star size={12} fill="currentColor" /> {t('place.recommended')}
            </span>
          )}
          {isStory && (
            <Link to="/history" className="badge accent">
              <BookOpenText size={12} /> История Самарканда
            </Link>
          )}
        </div>

        {isStory ? <p className="story-text">{place.description}</p> : <p>{place.description}</p>}

        <div className="card" style={{ padding: '4px 14px', marginTop: 12 }}>
          <div className="info-row">
            <Clock />
            <span className="k">Часы работы</span>
            <span className="v">{place.workingHours || '—'}</span>
          </div>
          <div className="info-row">
            <MapPin />
            <span className="k">Район</span>
            <span className="v">{place.district || '—'}</span>
          </div>
          {Object.entries(place.extraFields || {}).map(([k, v]) => (
            <div className="info-row" key={k}>
              <ListTree />
              <span className="k">{EXTRA_FIELD_LABEL[k] || k}</span>
              <span className="v">{String(v)}</span>
            </div>
          ))}
        </div>

        <a className="btn block" style={{ marginTop: 18 }} href={mapUrl} target="_blank" rel="noreferrer">
          <MapPin size={17} /> {t('place.showOnMap')}
        </a>
      </motion.div>
    </div>
  );
}
