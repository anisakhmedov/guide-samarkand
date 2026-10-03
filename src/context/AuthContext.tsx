import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../api/client';

export type ContactChannel = 'telegram' | 'whatsapp' | 'instagram' | 'wechat' | 'viber' | 'other';

export interface GuestContact {
  type: ContactChannel;
  value: string;
}

export interface EnterGatePayload {
  name: string;
  roomNumber: string;
  phone: string;
  contacts: GuestContact[];
}

export interface GuestMe {
  id: string;
  name: string;
  roomNumber: string;
  phone?: string;
  contacts?: GuestContact[];
  statusResidence: 'pending' | 'approved' | 'rejected';
  statusReview: 'not_sent' | 'pending' | 'approved';
  accessStatus: 'open' | 'closed';
  discountStatus: 'none' | 'pending' | 'approved';
  /** Registration step 2 — ISO country code and YYYY-MM-DD ('' until filled). */
  country?: string;
  birthDate?: string;
  /** Registration step 3 — set once the house rules are signed. */
  rulesAcceptedAt?: string | null;
}

interface AuthContextValue {
  guest: GuestMe | null;
  loading: boolean;
  reviewLinks: { google?: string; yandex?: string; twoGis?: string } | null;
  enterGate: (payload: EnterGatePayload) => Promise<void>;
  refresh: () => Promise<void>;
  saveProfile: (payload: { country: string; birthDate: string }) => Promise<void>;
  acceptRules: (signature: string) => Promise<void>;
  markReviewSubmitted: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [guest, setGuest] = useState<GuestMe | null>(null);
  const [reviewLinks, setReviewLinks] = useState<AuthContextValue['reviewLinks']>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setGuest(null);
      setLoading(false);
      return;
    }
    try {
      const [me, links] = await Promise.all([
        api.get<GuestMe>('/guest/me'),
        api.get<AuthContextValue['reviewLinks']>('/auth/guest/review-links').catch(() => null),
      ]);
      setGuest(me);
      setReviewLinks(links);
    } catch {
      clearToken();
      setGuest(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const enterGate = useCallback(async (payload: EnterGatePayload) => {
    const res = await api.post<{ token: string; guest: GuestMe; reviewLinks: AuthContextValue['reviewLinks'] }>(
      '/auth/guest/enter',
      payload,
    );
    setToken(res.token);
    setGuest(res.guest);
    setReviewLinks(res.reviewLinks);
  }, []);

  const saveProfile = useCallback(async (payload: { country: string; birthDate: string }) => {
    setGuest(await api.patch<GuestMe>('/guest/me/profile', payload));
  }, []);

  const acceptRules = useCallback(async (signature: string) => {
    setGuest(await api.post<GuestMe>('/guest/me/rules', { signature }));
  }, []);

  const markReviewSubmitted = useCallback(async () => {
    const updated = await api.patch<GuestMe>('/guest/me/review-submitted');
    setGuest(updated);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setGuest(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ guest, loading, reviewLinks, enterGate, refresh, saveProfile, acceptRules, markReviewSubmitted, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
