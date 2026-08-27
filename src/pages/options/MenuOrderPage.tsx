import { useEffect, useState } from 'react';
import { Minus, Plus, UtensilsCrossed } from 'lucide-react';
import { api, API_URL } from '../../api/client';
import { MenuItem, MenuItemType, ServiceRequestType } from '../../api/types';
import { RequestForm } from '../../components/RequestForm';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';

interface MenuOrderPageProps {
  menuType: MenuItemType;
  requestType: ServiceRequestType;
  titleKey: string;
}

// Shared by /options/food and /options/drinks — same room-service ordering flow, just a
// different MenuItem.type / ServiceRequest.type.
export function MenuOrderPage({ menuType, requestType, titleKey }: MenuOrderPageProps) {
  const { t } = useLang();
  const { guest } = useAuth();
  const [items, setItems] = useState<MenuItem[] | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});

  useEffect(() => {
    api
      .get<MenuItem[]>(`/menu?type=${menuType}`)
      .then(setItems)
      .catch(() => setItems([]));
  }, [menuType]);

  const setItemQty = (id: string, value: number) => {
    setQty((prev) => ({ ...prev, [id]: Math.max(0, value) }));
  };

  const hasDiscount = guest?.discountStatus === 'approved';
  const orderItems = (items || [])
    .filter((item) => (qty[item._id] || 0) > 0)
    .map((item) => ({
      menuItemId: item._id,
      name: item.name,
      qty: qty[item._id],
      price: hasDiscount ? item.discountedPrice : item.price,
    }));

  return (
    <RequestForm
      type={requestType}
      title={t(titleKey)}
      subtitle=""
      payload={{ items: orderItems }}
      disabled={orderItems.length === 0}
      onSentReset={() => setQty({})}
    >
      {items === null && <p className="muted">{t('common.loading')}</p>}

      {items !== null && items.length === 0 && (
        <div className="empty-state">
          <div className="icon-wrap">
            <UtensilsCrossed size={22} />
          </div>
          <p>{t('options.menu.empty')}</p>
        </div>
      )}

      {items?.map((item) => (
        <div key={item._id} className="card menu-item-row">
          {item.photo && (
            <img
              src={item.photo.startsWith('http') ? item.photo : `${API_URL}${item.photo}`}
              alt=""
              style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <div className="menu-item-row__body">
            <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{item.name}</div>
            {item.description && <div className="muted">{item.description}</div>}
            <div className="menu-item-row__price">
              {hasDiscount && item.discountedPrice !== item.price && (
                <span className="price-old">
                  {item.price.toLocaleString()} {t('common.currency')}
                </span>
              )}
              <span className="price-new">
                {(hasDiscount ? item.discountedPrice : item.price).toLocaleString()} {t('common.currency')}
              </span>
            </div>
          </div>
          <div className="qty-stepper">
            <button type="button" disabled={!qty[item._id]} onClick={() => setItemQty(item._id, (qty[item._id] || 0) - 1)}>
              <Minus size={14} />
            </button>
            <span>{qty[item._id] || 0}</span>
            <button type="button" onClick={() => setItemQty(item._id, (qty[item._id] || 0) + 1)}>
              <Plus size={14} />
            </button>
          </div>
        </div>
      ))}
    </RequestForm>
  );
}
