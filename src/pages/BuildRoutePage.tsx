import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Footprints, Car, MapPin, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { GuideRoute, Place, TransportType } from '../api/types';
import { useLang } from '../context/LangContext';

export function BuildRoutePage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [transport, setTransport] = useState<TransportType>('walking');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Place[]>('/places').then(setPlaces).catch(() => setPlaces([]));
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const route = await api.post<GuideRoute>('/routes/custom', { placeIds: selected, transportType: transport });
      navigate(`/guide/route/${route._id}`);
    } catch {
      setError(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page" style={{ paddingBottom: 130 }}>
      <h1>
        <Sparkles size={19} color="var(--color-gold)" style={{ verticalAlign: -3, marginRight: 6 }} />
        {t('guide.buildOwn')}
      </h1>

      <div className="muted" style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.04em' }}>
        {t('guide.filters.transport')}
      </div>
      <div className="chip-row">
        <span className={`chip ${transport === 'walking' ? 'active' : ''}`} onClick={() => setTransport('walking')}>
          <Footprints /> {t('guide.transport.walking')}
        </span>
        <span className={`chip ${transport === 'transport' ? 'active' : ''}`} onClick={() => setTransport('transport')}>
          <Car /> {t('guide.transport.transport')}
        </span>
      </div>

      <h2>Выберите места</h2>
      {places.map((p) => {
        const isSelected = selected.includes(p._id);
        return (
          <div key={p._id} className={`card pick-item ${isSelected ? 'selected' : ''}`} onClick={() => toggle(p._id)}>
            <div className="pick-item__check">{isSelected && <Check size={14} strokeWidth={3} />}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{p.name}</div>
              <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> {p.district || '—'}
              </div>
            </div>
          </div>
        );
      })}

      {error && <div className="error-text">{error}</div>}

      {selected.length > 0 && (
        <div className="sticky-footer-bar">
          <div className="muted">
            Выбрано: <strong style={{ color: 'var(--color-text)' }}>{selected.length}</strong>
          </div>
          <button className="btn" disabled={submitting} onClick={submit}>
            {t('guide.start')}
          </button>
        </div>
      )}
    </div>
  );
}
