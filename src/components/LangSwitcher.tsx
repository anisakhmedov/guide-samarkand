import { ChevronDown } from 'lucide-react';
import { LANGS, Lang } from '../i18n/dictionaries';
import { useLang } from '../context/LangContext';

// A single native <select> instead of a row of pill buttons — more compact (matters on
// narrow phones where header space is tight) and gives a proper native picker on mobile.
export function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-switcher">
      <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label="Language">
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <ChevronDown size={13} />
    </div>
  );
}
