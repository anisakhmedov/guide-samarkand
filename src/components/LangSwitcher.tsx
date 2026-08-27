import { LANGS } from '../i18n/dictionaries';
import { useLang } from '../context/LangContext';

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-switcher">
      {LANGS.map((l) => (
        <button key={l.code} className={l.code === lang ? 'active' : ''} onClick={() => setLang(l.code)}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
