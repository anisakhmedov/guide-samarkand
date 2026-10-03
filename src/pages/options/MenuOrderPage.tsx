import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { MenuItem, MenuItemType, ServiceRequestType } from '../../api/types';
import { FoodOrderCart } from '../../components/FoodOrderCart';

interface MenuOrderPageProps {
  menuType: MenuItemType;
  requestType: ServiceRequestType;
  titleKey: string;
}

// Menu ordering flow: displays items, then delegates to FoodOrderCart for basket/payment
export function MenuOrderPage({ menuType, requestType, titleKey }: MenuOrderPageProps) {
  const [items, setItems] = useState<MenuItem[] | null>(null);

  useEffect(() => {
    api
      .get<MenuItem[]>(`/menu?type=${menuType}`)
      .then(setItems)
      .catch(() => setItems([]));
  }, [menuType]);

  return <FoodOrderCart items={items} requestType={requestType} titleKey={titleKey} />;
}
