import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navigation, MapPin, Route as RouteIcon, Clock3 } from 'lucide-react';
import { api } from '../api/client';
import { GuideRoute, Place } from '../api/types';
import { useLang } from '../context/LangContext';

export function RouteDetailPage() {
  const { id } = useParams();
  const { t } = useLang();
  const [route, setRoute] = useState<GuideRoute | null>(null);

  useEffect(() => {
    if (id) api.get<GuideRoute>(`/routes/${id}`).then(setRoute).catch(() => setRoute(null));
  }, [id]);

  if (!route) {
    return (
      <div className="page">
        <div className="skeleton skeleton-line" style={{ width: '70%', height: 22 }} />
        <div className="skeleton skeleton-line" style={{ width: '40%' }} />
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      <h1>{route.title}</h1>
      <div className="chip-row">
        {route.theme && <span className="badge accent">{t(`guide.theme.${route.theme}`)}</span>}
        <span className="badge">{t(`guide.duration.${route.durationEstimate}`)}</span>
        <span className="badge">{t(`guide.transport.${route.transportType}`)}</span>
      </div>

      <div className="route-card__meta" style={{ marginBottom: 8 }}>
        <span>
          <MapPin /> {route.points.length} {t('route.points')}
        </span>
        <span>
          <RouteIcon /> {(route.totalDistanceMeters / 1000).toFixed(1)} км
        </span>
        <span>
          <Clock3 /> ~{route.totalDurationMinutes} мин
        </span>
      </div>

      <h2>Маршрут по точкам</h2>
      <ol className="step-list">
        {route.points.map((point, i) => {
          const place = point.placeId as Place;
          return (
            <li key={i}>
              <div className="step-num">{i + 1}</div>
              <div className="step-body">
                <div className="step-title">{place?.name || '—'}</div>
                {i > 0 && (
                  <div className="muted">
                    +{Math.round(point.legDistanceMeters)} м · ~{point.legDurationMinutes} мин
                  </div>
                )}
                {point.comment && <div className="step-comment">{point.comment}</div>}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="sticky-footer-bar">
        <div>
          <div style={{ fontWeight: 700 }}>{(route.totalDistanceMeters / 1000).toFixed(1)} км</div>
          <div className="muted">~{route.totalDurationMinutes} мин в пути</div>
        </div>
        <Link to={`/guide/route/${route._id}/play`} className="btn">
          <Navigation size={17} /> {t('route.player.start')}
        </Link>
      </div>
    </div>
  );
}
