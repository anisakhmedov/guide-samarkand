import { FormEvent, useRef, useState } from 'react';
import {
  Check,
  CigaretteOff,
  Clock,
  Coffee,
  Compass,
  Gem,
  Hammer,
  Hourglass,
  Receipt,
  ScrollText,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { ApiError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { HOUSE_RULES, RuleIcon } from '../../data/houseRules';
import { LangSwitcher } from '../LangSwitcher';
import { BirthDatePicker } from './BirthDatePicker';
import { CountryPicker } from './CountryPicker';
import { SignaturePad, SignaturePadHandle } from './SignaturePad';

const RULE_ICONS: Record<RuleIcon, { Icon: LucideIcon; tone: string }> = {
  clock: { Icon: Clock, tone: 'primary' },
  hourglass: { Icon: Hourglass, tone: 'gold' },
  valuables: { Icon: Gem, tone: 'purple' },
  damage: { Icon: Hammer, tone: 'accent' },
  smoking: { Icon: CigaretteOff, tone: 'danger' },
  kettle: { Icon: Coffee, tone: 'gold' },
  cleaning: { Icon: Sparkles, tone: 'success' },
  payment: { Icon: Receipt, tone: 'blue' },
};

/** "Contacts → Details → Rules" progress shown above each registration step. */
export function GateSteps({ current }: { current: 1 | 2 | 3 }) {
  const { t } = useLang();
  const steps = [t('gate.steps.contacts'), t('gate.steps.details'), t('gate.steps.rules')];
  return (
    <ol className="gate-steps" aria-label={t('gate.stepOf').replace('{n}', String(current))}>
      {steps.map((label, i) => {
        const n = i + 1;
        const state = n < current ? 'done' : n === current ? 'active' : '';
        return (
          <li key={label} className={`gate-steps__item ${state}`}>
            <span className="gate-steps__dot">{n < current ? <Check size={12} strokeWidth={3} /> : n}</span>
            <span className="gate-steps__label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function GateHeader({ title, subtitle, icon }: { title: string; subtitle: string; icon?: React.ReactNode }) {
  return (
    <header className="gate-head">
      <div className="gate-head__logo">{icon ?? <Compass size={22} strokeWidth={2} />}</div>
      <div className="gate-head__text">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <LangSwitcher />
    </header>
  );
}

function RestartLink() {
  const { t } = useLang();
  const { logout } = useAuth();
  return (
    <button type="button" className="gate-restart" onClick={logout}>
      {t('gate.restart')}
    </button>
  );
}

// Step 2: country of residence + date of birth.
export function ProfileStep() {
  const { t } = useLang();
  const { guest, saveProfile } = useAuth();
  const [country, setCountry] = useState(guest?.country ?? '');
  const [birthDate, setBirthDate] = useState(guest?.birthDate ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!country) return setError(t('gate.countryRequired'));
    if (!birthDate) return setError(t('gate.birthDateRequired'));
    setSubmitting(true);
    try {
      await saveProfile({ country, birthDate });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="gate-screen">
      <GateHeader title={t('gate.details.title')} subtitle={t('gate.details.subtitle')} />
      <GateSteps current={2} />
      <form onSubmit={onSubmit} className="gate-form">
        <div className="gate-field">
          <span>{t('gate.country')}</span>
          <CountryPicker
            value={country}
            onChange={(code) => {
              setCountry(code);
              setError('');
            }}
            placeholder={t('gate.countryPlaceholder')}
            emptyText={t('gate.countryEmpty')}
          />
        </div>
        <div className="gate-field">
          <span>{t('gate.birthDate')}</span>
          <BirthDatePicker
            value={birthDate}
            onChange={(date) => {
              setBirthDate(date);
              setError('');
            }}
            placeholder={t('gate.birthDatePlaceholder')}
            title={t('gate.birthDate')}
          />
        </div>
        {error && <div className="error-text gate-error">{error}</div>}
        <button className="btn block gate-submit" disabled={submitting} type="submit">
          {t('gate.submit')}
        </button>
      </form>
      <RestartLink />
    </div>
  );
}

// Step 3: house rules → "I agree" → handwritten signature.
export function RulesStep() {
  const { t, lang } = useLang();
  const { acceptRules } = useAuth();
  const padRef = useRef<SignaturePadHandle>(null);
  const [agreed, setAgreed] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const rules = HOUSE_RULES[lang];

  const submit = async () => {
    setError('');
    const signature = padRef.current?.toDataUrl();
    if (!agreed) return setError(t('gate.rules.needAgree'));
    if (!signature) return setError(t('gate.rules.needSignature'));
    setSubmitting(true);
    try {
      await acceptRules(signature);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="gate-screen gate-screen--long">
      <GateHeader title={t('gate.rules.title')} subtitle={t('gate.rules.subtitle')} icon={<ScrollText size={22} strokeWidth={2} />} />
      <GateSteps current={3} />

      <div className="gate-form rules-card">
        <ul className="rules-list">
          {rules.map((rule, i) => {
            const { Icon, tone } = RULE_ICONS[rule.icon];
            return (
              <li key={i} className="rules-item">
                <span className={`rules-item__icon tone-${tone}`}>
                  <Icon size={18} />
                </span>
                <div className="rules-item__body">
                  <div className="rules-item__title">{rule.title}</div>
                  <p className="rules-item__text">{rule.text}</p>
                  {rule.chips && (
                    <div className="rules-item__chips">
                      {rule.chips.map((chip) => (
                        <span key={chip} className={`rules-chip tone-${tone}`}>
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="gate-form">
        <label className={`agree-row ${agreed ? 'on' : ''}`}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              setError('');
            }}
          />
          <span className="agree-row__box">{agreed && <Check size={14} strokeWidth={3} />}</span>
          <span>{t('gate.rules.agree')}</span>
        </label>

        <div className={`gate-field ${agreed ? '' : 'is-disabled'}`}>
          <span>{t('gate.rules.signature')}</span>
          <SignaturePad
            ref={padRef}
            placeholder={t('gate.rules.signHere')}
            clearLabel={t('gate.rules.clear')}
            onChange={(ink) => {
              setHasInk(ink);
              setError('');
            }}
          />
        </div>

        {error && <div className="error-text gate-error">{error}</div>}
        <button type="button" className="btn block gate-submit" disabled={submitting || !agreed || !hasInk} onClick={submit}>
          <Check size={17} /> {t('gate.rules.submit')}
        </button>
      </div>
      <RestartLink />
    </div>
  );
}
