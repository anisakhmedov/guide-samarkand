import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../api/client';

export interface GuestMe {
  id: string;
  name: string;
  roomNumber: string;
  statusResidence: 'pending' | 'approved' | 'rejected';
  statusReview: 'not_sent' | 'pending' | 'approved';
  accessStatus: 'open' | 'closed';
}

interface AuthContextValue {
  guest: GuestMe | null;
  loading: boolean;
  reviewLinks: { google?: string; yandex?: string; twoGis?: string } | null;
  enterGate: (name: string, roomNumber: string) => Promise<void>;
  refresh: () => Promise<void>;
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
      const me = await api.get<GuestMe>('/guest/me');
      setGuest(me);
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

  const enterGate = useCallback(async (name: string, roomNumber: string) => {
    const res = await api.post<{ token: string; guest: GuestMe; reviewLinks: AuthContextValue['reviewLinks'] }>(
      '/auth/guest/enter',
      { name, roomNumber },
    );
    setToken(res.token);
    setGuest(res.guest);
    setReviewLinks(res.reviewLinks);
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
    <AuthContext.Provider value={{ guest, loading, reviewLinks, enterGate, refresh, markReviewSubmitted, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
