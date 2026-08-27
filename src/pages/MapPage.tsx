import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { LayoutGrid, UtensilsCrossed, Coffee, Landmark, ConciergeBell } from 'lucide-react';
import { api } from '../api/client';
import { Place, PlaceCategory } from '../api/types';
import { useLang } from '../context/LangContext';
import { hotelIcon, categoryMarkerIcon } from '../components/leafletIcons';
import { categoryColor } from '../theme';

const CATEGORIES: { code: PlaceCategory; Icon: typeof UtensilsCrossed }[] = [
  { code: 'restaurant', Icon: UtensilsCrossed },
  { code: 'cafe', Icon: Coffee },
  { code: 'attraction', Icon: Landmark },
  { code: 'service', Icon: ConciergeBell },
];
// The hotel's own coordinates — used as the map's reference point (PLAN.md "Позиция отеля
// отмечена как точка отсчёта"). Replace with the real hotel location.
const HOTEL_LOCATION: [number, number] = [39.6547, 66.975];

export function MapPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [category, setCategory] = useState<PlaceCategory | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    api.get<Place[]>('/places').then(setPlaces).catch(() => setPlaces([]));
  }, []);

  const filtered = category ? places.filter((p) => p.category === category) : places;

  // Init map once.
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;
    const map = L.map(mapDivRef.current).setView(HOTEL_LOCATION, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    L.marker(HOTEL_LOCATION, { icon: hotelIcon }).addTo(map).bindPopup('Отель');
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when the filtered place list changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = filtered.map((place) => {
      const marker = L.marker([place.location.lat, place.location.lng], { icon: categoryMarkerIcon(place.category) }).addTo(map);
      marker.bindPopup(place.name);
      marker.on('click', () => navigate(`/place/${place._id}`));
      return marker;
    });
  }, [filtered, navigate]);

  return (
    <div className="page" style={{ paddingBottom: 90 }}>
      <h1>{t('nav.map')}</h1>
      <div className="chip-row">
        <span className={`chip ${!category ? 'active' : ''}`} onClick={() => setCategory(null)}>
          <LayoutGrid /> {t('map.filters.all')}
        </span>
        {CATEGORIES.map(({ code, Icon }) => {
          const isActive = category === code;
          return (
            <span
              key={code}
              className={`chip ${isActive ? 'active' : ''}`}
              style={isActive ? { background: categoryColor[code], borderColor: categoryColor[code] } : undefined}
              onClick={() => setCategory(code)}
            >
              <Icon /> {t(`home.categories.${code}`)}
            </span>
          );
        })}
      </div>

      <div className="map-container" ref={mapDivRef} style={{ height: '58vh', marginTop: 6 }} />
    </div>
  );
}
