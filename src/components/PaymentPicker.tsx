import { Banknote, CreditCard } from 'lucide-react';
import { PaymentMethod } from '../api/types';
import { useLang } from '../context/LangContext';

const METHODS: { code: PaymentMethod; Icon: typeof Banknote; label: string; info: string }[] = [
  { code: 'cash', Icon: Banknote, label: 'options.cart.paymentCash', info: 'options.cart.paymentCashInfo' },
  { code: 'card', Icon: CreditCard, label: 'options.cart.paymentCard', info: 'options.cart.paymentCardInfo' },
];

export function PaymentPicker({ value, onChange }: { value: PaymentMethod | null; onChange: (m: PaymentMethod) => void }) {
  const { t } = useLang();
  return (
    <div className="pay-options" role="radiogroup">
      {METHODS.map(({ code, Icon, label, info }) => (
        <button
          key={code}
          type="button"
          role="radio"
          aria-checked={value === code}
          className={`pay-option ${value === code ? 'selected' : ''}`}
          onClick={() => onChange(code)}
        >
          <span className="pay-option__icon">
            <Icon size={20} />
          </span>
          <span className="pay-option__text">
            <span className="pay-option__label">{t(label)}</span>
            <span className="pay-option__info">{t(info)}</span>
          </span>
          <span className="pay-option__radio" />
        </button>
      ))}
    </div>
  );
}
