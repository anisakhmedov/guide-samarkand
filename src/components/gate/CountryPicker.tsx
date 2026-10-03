import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { countryName, flagOf, searchCountries } from '../../data/countries';
import { useLang } from '../../context/LangContext';

interface CountryPickerProps {
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
  emptyText: string;
}

// Type-to-filter combobox over every country. Matches Russian, English and Uzbek names plus
// common aliases, so "germ", "герм" and "olmon" all find Germany.
export function CountryPicker({ value, onChange, placeholder, emptyText }: CountryPickerProps) {
  const { lang } = useLang();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchCountries(query, lang), [query, lang]);
  const secondLang = lang === 'en' ? 'ru' : 'en';

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const pick = (code: string) => {
    onChange(code);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open && results[active]) {
      e.preventDefault();
      pick(results[active].code);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const selectedName = value ? countryName(value, lang) : '';

  return (
    <div className={`country-picker ${open ? 'open' : ''}`} ref={wrapRef}>
      <div className="gate-input-wrap">
        {value && !open ? <span className="country-picker__flag">{flagOf(value)}</span> : <Search size={16} />}
        <input
          ref={inputRef}
          className="gate-input"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          placeholder={selectedName || placeholder}
          value={open ? query : selectedName}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {value && !open ? (
          <button
            type="button"
            className="country-picker__clear"
            aria-label="Clear"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
          >
            <X size={15} />
          </button>
        ) : (
          <ChevronDown size={16} className="country-picker__chevron" />
        )}
      </div>

      {open && (
        <ul className="country-picker__list" role="listbox" ref={listRef}>
          {results.length === 0 && <li className="country-picker__empty">{emptyText}</li>}
          {results.map((c, i) => (
            <li
              key={c.code}
              data-index={i}
              role="option"
              aria-selected={c.code === value}
              className={`country-picker__item ${i === active ? 'active' : ''} ${c.code === value ? 'selected' : ''}`}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => pick(c.code)}
              onMouseEnter={() => setActive(i)}
            >
              <span className="country-picker__flag">{flagOf(c.code)}</span>
              <span className="country-picker__name">{c.names[lang]}</span>
              {c.names[secondLang] !== c.names[lang] && <span className="country-picker__alt">{c.names[secondLang]}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
