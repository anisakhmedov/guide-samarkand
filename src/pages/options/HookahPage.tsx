import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Flame } from 'lucide-react';
import { api } from '../../api/client';
import { HookahInfo, PaymentMethod } from '../../api/types';
import { useLang } from '../../context/LangContext';
import { PageHeader } from '../../components/PageHeader';
import { PaymentPicker } from '../../components/PaymentPicker';
import { QtyStepper } from '../../components/FoodOrderCart';

// Options -> "Кальян": the price is set by the hotel in the admin Settings page; the server
// recomputes the total from that setting, so the amount shown here is display-only.
export function HookahPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [info, setInfo] = useState<HookahInfo | null>(null);
  const [qty, setQty] = useState(1);
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [placedTotal, setPlacedTotal] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<HookahInfo>('/settings/hookah')
      .then(setInfo)
      .catch(() => setInfo({ price: 0, available: false }));
  }, []);

  const money = (v: number) => `${Math.round(v).toLocaleString()} ${t('common.currency')}`;
  const total = (info?.price ?? 0) * qty;

  const submit = async () => {
    if (!paymentMethod) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await api.post<{ total?: number }>('/service-requests', {
        type: 'hookah',
        payload: { qty, time, note, paymentMethod },
      });
      setPlacedTotal(created?.total || total);
    } catch (e: any) {
      setError(e.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (placedTotal !== null) {
    const msgKey = paymentMethod === 'cash' ? 'options.cart.confirmationCash' : 'options.cart.confirmationCard';
    return (
      <div className="page page--narrow">
        <div className="done-card card">
          <CheckCircle2 size={44} color="var(--color-success)" />
          <h1>{t('options.cart.confirmationTitle')}</h1>
          <p>{t(msgKey)}</p>
          <div className="summary-box">
            <div className="summary-line">
              <span>
                {t('options.hookah')} × {qty}
              </span>
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

  return (
    <div className="page page--narrow">
      <PageHeader title={t('options.hookah')} />
      <p>{t('options.hookah.subtitle')}</p>

      {info === null && <p className="muted">{t('common.loading')}</p>}

      {info && !info.available && (
        <div className="card notice-card">
          <Flame size={20} />
          <span>{t('options.hookah.unavailable')}</span>
        </div>
      )}

      {info?.available && (
        <>
          <div className="card hookah-card">
            <span className="hookah-card__icon">
              <Flame size={24} />
            </span>
            <div className="hookah-card__body">
              <div className="muted">{t('options.hookah.price')}</div>
              <div className="hookah-card__price">{money(info.price)}</div>
            </div>
            <QtyStepper value={qty} onChange={setQty} min={1} max={10} />
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label>{t('options.hookah.time')}</label>
            <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="field">
            <label>{t('options.form.note')}</label>
            <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <h2>{t('options.cart.paymentMethod')}</h2>
          <PaymentPicker value={paymentMethod} onChange={setPaymentMethod} />

          <div className="summary-box">
            <div className="summary-line">
              <span>
                {money(info.price)} × {qty}
              </span>
            </div>
            <div className="summary-line total">
              <span>{t('options.cart.total')}</span>
              <span>{money(total)}</span>
            </div>
          </div>

          {error && <div className="error-text">{error}</div>}

          <button className="btn block" style={{ marginTop: 14 }} disabled={!paymentMethod || submitting} onClick={submit}>
            {submitting ? t('common.loading') : `${t('options.hookah.submit')} · ${money(total)}`}
          </button>
        </>
      )}
    </div>
  );
}
