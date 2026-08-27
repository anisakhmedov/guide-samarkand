import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, UtensilsCrossed, Coffee, Landmark, ConciergeBell } from 'lucide-react';
import { Place } from '../api/types';
import { API_URL } from '../api/client';
import { categoryColor, categoryColorDark, categoryColorLight } from '../theme';

const categoryIcon: Record<string, typeof UtensilsCrossed> = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  attraction: Landmark,
  service: ConciergeBell,
};

export function PlaceCard({ place }: { place: Place }) {
  const photo = place.photos[0];
  const Icon = categoryIcon[place.category] || MapPin;

  return (
    <motion.div whileTap={{ scale: 0.95 }} style={{ flexShrink: 0 }}>
      <Link to={`/place/${place._id}`} className="place-card">
        <div
          className="place-card__photo"
          style={!photo ? { background: `linear-gradient(135deg, ${categoryColorLight[place.category]}, ${categoryColor[place.category]})` } : undefined}
        >
          {photo ? (
            <img src={photo.startsWith('http') ? photo : `${API_URL}${photo}`} alt={place.name} />
          ) : (
            <Icon size={26} strokeWidth={1.6} color={categoryColorDark[place.category]} />
          )}
          <div className="place-card__cat-icon" style={{ color: categoryColorDark[place.category] }}>
            <Icon size={14} />
          </div>
          {place.recommendedByHotel && (
            <div className="place-card__star">
              <Star size={13} fill="#fff" />
            </div>
          )}
        </div>
        <div className="place-card__body">
          <div className="place-card__title">{place.name}</div>
          <div className="place-card__meta">
            <MapPin size={12} /> {place.district || '—'}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function PlaceCardSkeleton() {
  return <div className="skeleton skeleton-card" />;
}
