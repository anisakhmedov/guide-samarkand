// Countries for the registration "country of residence" picker. Names come from the
// browser's own CLDR data (Intl.DisplayNames) in ru/en/uz, so the list stays complete and
// correctly spelled without shipping a translation table; ALIASES adds the colloquial forms
// people actually type ("США", "UK", "Англия", "Dubai"…).

export const COUNTRY_CODES = [
  'AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB',
  'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BQ', 'BA', 'BW', 'BV', 'BR', 'IO', 'BN', 'BG', 'BF', 'BI', 'CV', 'KH', 'CM',
  'CA', 'KY', 'CF', 'TD', 'CL', 'CN', 'CX', 'CC', 'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CW', 'CY', 'CZ',
  'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF',
  'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY', 'HT', 'HM', 'VA', 'HN',
  'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR',
  'XK', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH',
  'MQ', 'MR', 'MU', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ',
  'NI', 'NE', 'NG', 'NU', 'NF', 'MK', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT',
  'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC',
  'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'SS', 'ES', 'LK', 'SD', 'SR', 'SJ', 'SE', 'CH', 'SY', 'TW', 'TJ',
  'TZ', 'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UM', 'UY', 'UZ',
  'VU', 'VE', 'VN', 'VG', 'VI', 'WF', 'EH', 'YE', 'ZM', 'ZW',
] as const;

/** Shown first when the search box is empty — the hotel's most common guest countries. */
export const POPULAR = ['UZ', 'RU', 'KZ', 'KG', 'TJ', 'TM', 'TR', 'CN', 'KR', 'IN', 'US', 'DE', 'GB', 'FR', 'IT', 'AE', 'JP'];

const ALIASES: Record<string, string[]> = {
  US: ['США', 'Америка', 'Штаты', 'USA', 'America', 'United States', 'AQSH', 'Amerika'],
  GB: ['Англия', 'Великобритания', 'Британия', 'Шотландия', 'UK', 'England', 'Britain', 'Great Britain', 'Scotland', 'Angliya', 'Buyuk Britaniya'],
  AE: ['ОАЭ', 'Эмираты', 'Дубай', 'Абу-Даби', 'UAE', 'Emirates', 'Dubai', 'Abu Dhabi', 'BAA'],
  RU: ['Россия', 'РФ', 'Russia', 'Rossiya'],
  UZ: ['Узбекистан', 'Ўзбекистон', 'Uzbekistan', "O'zbekiston", 'Ozbekiston', 'Uzbekiston'],
  KZ: ['Казахстан', 'Kazakhstan', "Qozog'iston", 'Qazaqstan'],
  KG: ['Киргизия', 'Кыргызстан', 'Kyrgyzstan', 'Kirgizia', "Qirg'iziston"],
  TJ: ['Таджикистан', 'Tajikistan', 'Tojikiston'],
  TM: ['Туркмения', 'Туркменистан', 'Turkmenistan', 'Turkmaniston'],
  TR: ['Турция', 'Turkey', 'Türkiye', 'Turkiya'],
  BY: ['Беларусь', 'Белоруссия', 'Belarus', 'Byelorussia'],
  KR: ['Корея', 'Южная Корея', 'Korea', 'South Korea', 'Janubiy Koreya'],
  KP: ['Северная Корея', 'North Korea', 'КНДР'],
  CN: ['Китай', 'КНР', 'China', 'Xitoy'],
  DE: ['Германия', 'Germany', 'Deutschland', 'Olmoniya'],
  NL: ['Голландия', 'Нидерланды', 'Holland', 'Netherlands', 'Niderlandiya'],
  CZ: ['Чехия', 'Czech', 'Czechia', 'Chexiya'],
  CH: ['Швейцария', 'Switzerland', 'Shveytsariya'],
  IR: ['Иран', 'Персия', 'Iran', 'Persia', 'Eron'],
  IN: ['Индия', 'India', 'Hindiston'],
  JP: ['Япония', 'Japan', 'Yaponiya'],
  MD: ['Молдавия', 'Молдова', 'Moldova'],
  CI: ["Кот-д'Ивуар", 'Ivory Coast'],
  CD: ['ДР Конго', 'DR Congo'],
  MK: ['Македония', 'Macedonia', 'North Macedonia'],
  SZ: ['Свазиленд', 'Swaziland', 'Eswatini'],
  MM: ['Бирма', 'Burma', 'Myanmar'],
  VA: ['Ватикан', 'Vatican'],
  PS: ['Палестина', 'Palestine'],
  SA: ['Саудовская Аравия', 'Saudi Arabia', 'KSA'],
  AZ: ['Азербайджан', 'Azerbaijan', 'Ozarbayjon'],
  AF: ['Афганистан', 'Afghanistan', "Afg'oniston"],
  PK: ['Пакистан', 'Pakistan', 'Pokiston'],
};

export interface Country {
  code: string;
  names: Record<'ru' | 'en' | 'uz', string>;
  /** Normalized names + aliases used for matching. */
  search: string[];
}

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ё/g, 'е')
    .replace(/[ʻʼ'’`‘]/g, '')
    .replace(/[-–—.,()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const flagOf = (code: string) => String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

let cache: Country[] | null = null;

function displayNames(locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' });
  } catch {
    return null;
  }
}

export function getCountries(): Country[] {
  if (cache) return cache;
  const dn = { ru: displayNames('ru'), en: displayNames('en'), uz: displayNames('uz-Latn') ?? displayNames('uz') };
  cache = COUNTRY_CODES.map((code) => {
    const names = {
      ru: dn.ru?.of(code) || code,
      en: dn.en?.of(code) || code,
      uz: dn.uz?.of(code) || dn.en?.of(code) || code,
    };
    const all = [names.ru, names.en, names.uz, code, ...(ALIASES[code] || [])];
    return { code, names, search: [...new Set(all.map(normalize))] };
  });
  return cache;
}

export function countryName(code: string, lang: 'ru' | 'en' | 'uz') {
  const c = getCountries().find((x) => x.code === code);
  return c ? c.names[lang] : code;
}

// Small bounded edit distance (typo tolerance: "узбикистан", "germny").
function distance(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Ranked matches: name starts with query → a word starts with it → contains it → close typo. */
export function searchCountries(query: string, lang: 'ru' | 'en' | 'uz', limit = 60): Country[] {
  const countries = getCountries();
  const q = normalize(query);
  const byName = (a: Country, b: Country) => a.names[lang].localeCompare(b.names[lang], lang);
  if (!q) {
    const popular = POPULAR.map((code) => countries.find((c) => c.code === code)!).filter(Boolean);
    const rest = countries.filter((c) => !POPULAR.includes(c.code)).sort(byName);
    return [...popular, ...rest];
  }
  const maxTypos = q.length >= 7 ? 2 : q.length >= 4 ? 1 : 0;
  const scored: { c: Country; score: number }[] = [];
  for (const c of countries) {
    let best = 99;
    for (const s of c.search) {
      if (s.startsWith(q)) best = Math.min(best, 0);
      else if (s.split(' ').some((w) => w.startsWith(q))) best = Math.min(best, 1);
      else if (s.includes(q)) best = Math.min(best, 2);
      else if (maxTypos && distance(q, s.slice(0, q.length), maxTypos) <= maxTypos) best = Math.min(best, 3);
      if (best === 0) break;
    }
    if (best < 99) scored.push({ c, score: best });
  }
  return scored
    .sort((a, b) => a.score - b.score || byName(a.c, b.c))
    .slice(0, limit)
    .map((x) => x.c);
}
