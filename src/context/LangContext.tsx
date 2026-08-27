import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { dictionaries, Lang } from '../i18n/dictionaries';

const STORAGE_KEY = 'guide_lang';

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextValue | undefined>(undefined);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem(STORAGE_KEY) as Lang) || 'ru');

  const setLang = (l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  };

  const t = useMemo(() => {
    const dict = dictionaries[lang];
    return (key: string) => dict[key] ?? key;
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
