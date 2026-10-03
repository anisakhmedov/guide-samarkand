import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLang } from '../../context/LangContext';

const LOCALES: Record<string, string> = { ru: 'ru-RU', en: 'en-GB', uz: 'uz-Latn-UZ' };
const MIN_YEAR = 1920;

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parseIso = (v: string) => {
  const [y, m, d] = v.split('-').map(Number);
  return y && m && d ? { y, m: m - 1, d } : null;
};

interface BirthDatePickerProps {
  value: string; // YYYY-MM-DD or ''
  onChange: (value: string) => void;
  placeholder: string;
  title: string;
}

// Date-of-birth picker: month + year dropdowns over a day grid. Native date inputs open on
// today's month, which means hundreds of taps back to a birth year on Android — here the
// year is one dropdown away. Future dates are disabled.
export function BirthDatePicker({ value, onChange, placeholder, title }: BirthDatePickerProps) {
  const { lang } = useLang();
  const locale = LOCALES[lang] || 'ru-RU';
  const today = new Date();
  const selected = parseIso(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => (selected ? { y: selected.y, m: selected.m } : { y: today.getFullYear() - 30, m: 0 }));

  const monthNames = useMemo(
    () => Array.from({ length: 12 }, (_, m) => new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, m, 1))),
    [locale],
  );
  // Monday-first short weekday names (2024-01-01 was a Monday).
  const weekdays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2024, 0, 1 + i))),
    [locale],
  );
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = today.getFullYear(); y >= MIN_YEAR; y--) list.push(y);
    return list;
  }, []);

  const openPicker = () => {
    if (selected) setView({ y: selected.y, m: selected.m });
    setOpen(true);
  };

  const shift = (delta: number) =>
    setView(({ y, m }) => {
      const next = new Date(y, m + delta, 1);
      if (next.getFullYear() < MIN_YEAR || next > today) return { y, m };
      return { y: next.getFullYear(), m: next.getMonth() };
    });

  const firstWeekday = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const isFuture = (d: number) => new Date(view.y, view.m, d) > today;
  const atLatestMonth = view.y === today.getFullYear() && view.m === today.getMonth();

  const label = selected
    ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(selected.y, selected.m, selected.d))
    : '';

  return (
    <>
      <button type="button" className={`gate-input date-field ${label ? '' : 'empty'}`} onClick={openPicker}>
        <CalendarDays size={16} />
        <span>{label || placeholder}</span>
      </button>

      {open &&
        createPortal(
          <div className="calendar-overlay" onClick={() => setOpen(false)}>
            <div className="calendar-sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
              <div className="calendar-sheet__head">
                <span>{title}</span>
                <button type="button" className="calendar-sheet__close" onClick={() => setOpen(false)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <div className="calendar-nav">
                <button type="button" className="calendar-nav__arrow" onClick={() => shift(-1)} aria-label="Previous month">
                  <ChevronLeft size={18} />
                </button>
                <select value={view.m} onChange={(e) => setView((v) => ({ ...v, m: Number(e.target.value) }))} aria-label="Month">
                  {monthNames.map((name, m) => (
                    <option key={m} value={m} disabled={view.y === today.getFullYear() && m > today.getMonth()}>
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  value={view.y}
                  onChange={(e) => {
                    const y = Number(e.target.value);
                    setView((v) => ({ y, m: y === today.getFullYear() ? Math.min(v.m, today.getMonth()) : v.m }));
                  }}
                  aria-label="Year"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <button type="button" className="calendar-nav__arrow" onClick={() => shift(1)} disabled={atLatestMonth} aria-label="Next month">
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="calendar-grid">
                {weekdays.map((w) => (
                  <span key={w} className="calendar-grid__weekday">
                    {w}
                  </span>
                ))}
                {cells.map((d, i) =>
                  d === null ? (
                    <span key={`e${i}`} />
                  ) : (
                    <button
                      key={d}
                      type="button"
                      disabled={isFuture(d)}
                      className={`calendar-grid__day ${selected && selected.y === view.y && selected.m === view.m && selected.d === d ? 'selected' : ''}`}
                      onClick={() => {
                        onChange(toIso(view.y, view.m, d));
                        setOpen(false);
                      }}
                    >
                      {d}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
