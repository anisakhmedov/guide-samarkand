import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import L from 'leaflet';
import { AnimatePresence, motion } from 'framer-motion';
import { PartyPopper, LocateFixed } from 'lucide-react';
import { api } from '../api/client';
import { GuideRoute, Place } from '../api/types';
import { useLang } from '../context/LangContext';
import { numberedIcon, youIcon } from '../components/leafletIcons';

const ARRIVAL_RADIUS_METERS = 50;

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Step-by-step navigation with live geolocation (PLAN.md "Прохождение маршрута").
// First iteration, per PLAN.md recommendation: static route display + live location,
// auto-marking of visited stops on proximity — without full path recalculation on deviation.
// The route itself (points, order, leg distances) is precomputed server-side via OSRM.
export function RoutePlayerPage() {
  const { id } = useParams();
  const { t } = useLang();
  const [route, setRoute] = useState<GuideRoute | null>(null);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [geoError, setGeoError] = useState('');
  const [visited, setVisited] = useState<Set<number>>(new Set());

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const youMarkerRef = useRef<L.Marker | null>(null);
  const stepMarkersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (id) api.get<GuideRoute>(`/routes/${id}`).then(setRoute).catch(() => setRoute(null));
  }, [id]);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setGeoError('Geolocation not supported');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setPosition(pos),
      (err) => setGeoError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Auto-mark visited points on proximity.
  useEffect(() => {
    if (!route || !position) return;
    const here = { lat: position.coords.latitude, lng: position.coords.longitude };
    route.points.forEach((point, i) => {
      const place = point.placeId as Place;
      if (place && haversine(here, place.location) <= ARRIVAL_RADIUS_METERS) {
        setVisited((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
      }
    });
  }, [position, route]);

  // Draw the route once on Leaflet.
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current || !route) return;
    const path = route.points.map((p) => (p.placeId as Place)?.location).filter(Boolean) as { lat: number; lng: number }[];
    if (path.length === 0) return;

    const map = L.map(mapDivRef.current).setView([path[0].lat, path[0].lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    L.polyline(
      path.map((p) => [p.lat, p.lng]),
      { color: '#f2703c', weight: 4, dashArray: '1 10', lineCap: 'round' },
    ).addTo(map);
    stepMarkersRef.current = path.map((loc, i) => L.marker([loc.lat, loc.lng], { icon: numberedIcon(i + 1) }).addTo(map));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [route]);

  // Refresh step marker colors as points get visited.
  useEffect(() => {
    stepMarkersRef.current.forEach((marker, i) => marker.setIcon(numberedIcon(i + 1, visited.has(i))));
  }, [visited]);

  // Live position marker.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !position) return;
    const here: [number, number] = [position.coords.latitude, position.coords.longitude];
    if (!youMarkerRef.current) {
      youMarkerRef.current = L.marker(here, { icon: youIcon, zIndexOffset: 1000 }).addTo(map);
    } else {
      youMarkerRef.current.setLatLng(here);
    }
  }, [position]);

  if (!route) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: '38vh', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  const allDone = visited.size >= route.points.length;
  const nextIndex = [...route.points.keys()].find((i) => !visited.has(i));

  return (
    <div className="page" style={{ paddingBottom: 90 }}>
      <h1>{route.title}</h1>

      <div className="map-container" ref={mapDivRef} style={{ height: '36vh', marginBottom: 14 }} />

      {!position && !geoError && (
        <div className="badge" style={{ marginBottom: 10 }}>
          <LocateFixed size={13} /> {t('route.player.locating')}
        </div>
      )}
      {geoError && <p className="error-text">{geoError}</p>}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 16 }}
            className="badge success"
            style={{ marginBottom: 12, fontSize: '0.84rem', padding: '9px 15px' }}
          >
            <motion.span
              animate={{ rotate: [0, -12, 12, -8, 0] }}
              transition={{ duration: 0.6, delay: 0.15 }}
              style={{ display: 'inline-flex' }}
            >
              <PartyPopper size={15} />
            </motion.span>{' '}
            {t('route.player.finish')}
          </motion.div>
        )}
      </AnimatePresence>

      <ol className="step-list">
        {route.points.map((point, i) => {
          const place = point.placeId as Place;
          const isVisited = visited.has(i);
          const isNext = i === nextIndex;
          return (
            <li key={i} className={isVisited ? 'done' : ''}>
              <div className="step-num">{isVisited ? '✓' : i + 1}</div>
              <div className="step-body">
                <div className="step-title" style={{ opacity: isNext || isVisited ? 1 : 0.7 }}>
                  {place?.name || '—'}
                  {isNext && <span className="badge accent" style={{ marginLeft: 8 }}>дальше</span>}
                </div>
                {position && place && (
                  <div className="muted">{Math.round(haversine({ lat: position.coords.latitude, lng: position.coords.longitude }, place.location))} м от вас</div>
                )}
                {point.comment && <div className="step-comment">{point.comment}</div>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
