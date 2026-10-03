import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { MenuItem, PaymentMethod, ServiceRequestType } from '../api/types';
import { api, API_URL } from '../api/client';
import { useLang } from '../context/LangContext';
import { PageHeader } from './PageHeader';
import { PaymentPicker } from './PaymentPicker';

type Stage = 'selecting' | 'checkout' | 'confirmation';

export interface FoodOrderCartProps {
  items: MenuItem[] | null;
  requestType: ServiceRequestType;
  titleKey: string;
}

export function QtyStepper({ value, onChange, min = 0, max = 50 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="qty-stepper">
      <button type="button" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} aria-label="−">
        <Minus size={14} />
      </button>
      <span>{value}</span>
      <button type="button" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} aria-label="+">
        <Plus size={14} />
      </button>
    </div>
  );
}

// Prices from /menu already include the hotel markup (VAT/delivery); `discountedPrice` is
// what this guest actually pays (equal to `price` unless their review discount is approved).
// The server re-prices the order on submit, so these totals are display-only.
export function FoodOrderCart({ items, requestType, titleKey }: FoodOrderCartProps) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [stage, setStage] = useState<Stage>('selecting');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [placedTotal, setPlacedTotal] = useState(0);

  const currency = t('common.currency');
  const money = (v: number) => `${Math.round(v).toLocaleString()} ${currency}`;
  const setQty = (id: string, value: number) => setQuantities((prev) => ({ ...prev, [id]: Math.max(0, value) }));

  const cartItems = (items || []).filter((item) => (quantities[item._id] || 0) > 0);
  const count = cartItems.reduce((sum, item) => sum + quantities[item._id], 0);
  const total = cartItems.reduce((sum, item) => sum + item.discountedPrice * quantities[item._id], 0);
  const fullPrice = cartItems.reduce((sum, item) => sum + item.price * quantities[item._id], 0);
  const discount = fullPrice - total;
  const hasDiscount = (items || []).some((item) => item.discountedPrice < item.price);

  const submit = async () => {
    if (!paymentMethod) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await api.post<{ total?: number }>('/service-requests', {
        type: requestType,
        payload: {
          items: cartItems.map((item) => ({ menuItemId: item._id, name: item.name, qty: quantities[item._id], price: item.discountedPrice })),
          paymentMethod,
        },
      });
      setPlacedTotal(created?.total || total);
      setStage('confirmation');
    } catch (e: any) {
      setError(e.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (stage === 'confirmation') {
    const msgKey = paymentMethod === 'cash' ? 'options.cart.confirmationCash' : 'options.cart.confirmationCard';
    return (
      <div className="page page--narrow">
        <div className="done-card card">
          <CheckCircle2 size={44} color="var(--color-success)" />
          <h1>{t('options.cart.confirmationTitle')}</h1>
          <p>{t(msgKey)}</p>
          <div className="summary-box">
            <div className="summary-line">
              <span>{t('options.cart.paymentMethod')}</span>
              <strong>{paymentMethod === 'cash' ? t('options.cart.paymentCash') : t('options.cart.paymentCard')}</strong>
            </div>
            <div className="summary-line total">
              <span>{t('options.cart.total')}</span>
              <span>{money(placedTotal)}</span>
            </div>
          </div>
          <button className="btn block" onClick={() => navigate('/')}>
            {t('nav.options')}
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'checkout') {
    return (
      <div className="page page--narrow">
        <PageHeader title={t('options.cart.title')} onBack={() => setStage('selecting')} />

        <div className="card cart-list">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-row">
              <div className="cart-row__body">
                <div className="cart-row__name">{item.name}</div>
                <div className="muted">{money(item.discountedPrice)}</div>
              </div>
              <QtyStepper value={quantities[item._id]} onChange={(v) => setQty(item._id, v)} />
              <div className="cart-row__sum">{money(item.discountedPrice * quantities[item._id])}</div>
              <button type="button" className="cart-row__remove" onClick={() => setQty(item._id, 0)} aria-label={t('options.cart.remove')}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {cartItems.length === 0 && <p className="muted" style={{ padding: 14, margin: 0 }}>{t('options.menu.empty')}</p>}
        </div>

        <div className="summary-box">
          {discount > 0 && (
            <>
              <div className="summary-line">
                <span>{t('options.cart.subtotal')}</span>
                <span>{money(fullPrice)}</span>
              </div>
              <div className="summary-line discount">
                <span>{t('options.cart.discount')}</span>
                <span>−{money(discount)}</span>
              </div>
            </>
          )}
          <div className="summary-line total">
            <span>{t('options.cart.total')}</span>
            <span>{money(total)}</span>
          </div>
          <div className="summary-note">{t('options.cart.taxIncluded')}</div>
        </div>

        <h2>{t('options.cart.paymentMethod')}</h2>
        <PaymentPicker value={paymentMethod} onChange={setPaymentMethod} />

        {error && <div className="error-text">{error}</div>}

        <button className="btn block" style={{ marginTop: 16 }} disabled={!paymentMethod || submitting || cartItems.length === 0} onClick={submit}>
          {submitting ? t('common.loading') : `${t('options.cart.confirm')} · ${money(total)}`}
        </button>
        <button className="btn secondary block" style={{ marginTop: 8 }} onClick={() => setStage('selecting')} disabled={submitting}>
          {t('options.cart.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title={t(titleKey)} aside={hasDiscount ? <span className="badge success">{t('options.menu.discountBadge')}</span> : undefined} />

      {items === null && <p className="muted">{t('common.loading')}</p>}

      {items !== null && items.length === 0 && (
        <div className="empty-state">
          <div className="icon-wrap">
            <ShoppingCart size={22} />
          </div>
          <p>{t('options.menu.empty')}</p>
        </div>
      )}

      <div className="menu-grid">
        {items?.map((item) => {
          const qty = quantities[item._id] || 0;
          return (
            <div key={item._id} className={`card menu-item-row ${qty > 0 ? 'in-cart' : ''}`}>
              {item.photo && <img className="menu-item-row__photo" src={item.photo.startsWith('http') ? item.photo : `${API_URL}${item.photo}`} alt={item.name} />}
              <div className="menu-item-row__body">
                <div className="menu-item-row__name">{item.name}</div>
                {item.description && <div className="menu-item-row__desc">{item.description}</div>}
                <div className="menu-item-row__price">
                  <span className="price-new">{money(item.discountedPrice)}</span>
                  {item.discountedPrice < item.price && <span className="price-old">{money(item.price)}</span>}
                </div>
              </div>
              {qty > 0 ? (
                <QtyStepper value={qty} onChange={(v) => setQty(item._id, v)} />
              ) : (
                <button type="button" className="add-btn" onClick={() => setQty(item._id, 1)} aria-label="+">
                  <Plus size={18} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {cartItems.length > 0 && (
        <div className="cart-bar">
          <div className="cart-bar__info">
            <span className="cart-bar__count">
              <ShoppingCart size={16} /> {count} {t('options.cart.items')}
            </span>
            <span className="cart-bar__total">{money(total)}</span>
          </div>
          <button className="btn" onClick={() => setStage('checkout')}>
            {t('options.cart.open')}
          </button>
        </div>
      )}
    </div>
  );
}
