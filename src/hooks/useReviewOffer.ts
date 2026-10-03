import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { GuestMe } from '../context/AuthContext';

export type ReviewState = 'not_sent' | 'pending' | 'approved';

/**
 * One review = hotel review + menu discount. Guests from before the merge can have only one
 * of the two statuses set, so the combined state takes whichever is further along.
 */
export function reviewState(guest: GuestMe | null): ReviewState {
  if (!guest) return 'not_sent';
  if (guest.discountStatus === 'approved') return 'approved';
  if (guest.statusReview === 'pending' || guest.discountStatus === 'pending') return 'pending';
  if (guest.statusReview === 'approved') return 'approved';
  return 'not_sent';
}

let cachedPercent: number | null = null;

/** Review discount % from hotel settings (public endpoint, cached for the session). */
export function useDiscountPercent() {
  const [percent, setPercent] = useState<number | null>(cachedPercent);
  useEffect(() => {
    if (cachedPercent !== null) return;
    api
      .get<{ discountPercent: number }>('/settings/discount')
      .then((r) => {
        cachedPercent = r.discountPercent;
        setPercent(r.discountPercent);
      })
      .catch(() => {});
  }, []);
  return percent;
}

/** Replaces `{p}` in a translated string with the discount percent. */
export const withPercent = (text: string, percent: number | null) => text.replace('{p}', String(percent ?? ''));
