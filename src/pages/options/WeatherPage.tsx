import { useEffect, useState } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  type LucideIcon,
} from 'lucide-react';
import { api } from '../../api/client';
import { WeatherInfo } from '../../api/types';
import { useLang } from '../../context/LangContext';

const WEATHER_ICONS: Record<string, LucideIcon> = {
  clear: Sun,
  partly_cloudy: CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  thunderstorm: CloudLightning,
};

export function WeatherPage() {
  const { t } = useLang();
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  useEffect(() => {
    api
      .get<WeatherInfo>('/weather')
      .then(setWeather)
      .catch(() => setWeather(null));
  }, []);

  const CurrentIcon = weather ? WEATHER_ICONS[weather.current.label] || Cloud : Cloud;

  return (
    <div className="page">
      <h1>{t('options.weather')}</h1>
      <p>{t('options.weather.subtitle')}</p>

      {!weather && <p className="muted">{t('common.loading')}</p>}

      {weather && (
        <>
          <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
            <CurrentIcon size={40} color="var(--color-gold)" />
            <div>
              <div className="muted">{t('options.weather.now')}</div>
              <div style={{ fontWeight: 800, fontSize: '1.6rem' }}>{weather.current.temp}°C</div>
              <div className="muted">{t(`weather.${weather.current.label}`)}</div>
            </div>
          </div>

          <h2>{t('options.weather.forecast')}</h2>
          <div className="hscroll">
            {weather.daily.map((day) => {
              const DayIcon = WEATHER_ICONS[day.label] || Cloud;
              return (
                <div key={day.date} className="card weather-day-card">
                  <div className="weather-day-card__date">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </div>
                  <div className="weather-day-card__icon">
                    <DayIcon size={26} />
                  </div>
                  <div className="weather-day-card__temps">
                    {day.max}° <span className="min">{day.min}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
