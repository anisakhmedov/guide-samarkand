import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { api } from '../api/client';
import { ServiceRequest } from '../api/types';
import { RequestCard } from '../components/RequestCard';
import { useLang } from '../context/LangContext';

// Status feed for everything the guest has sent from Options (food/drink orders,
// wake-up, cleaning, problem reports, extension requests). Chat has its own tile/page
// with its own unread tracking — this page is requests-only on purpose.
export function NotificationsPage() {
  const { t } = useLang();
  const [requests, setRequests] = useState<ServiceRequest[] | null>(null);
  const [marking, setMarking] = useState(false);

  const load = () =>
    api
      .get<ServiceRequest[]>('/service-requests/mine')
      .then((list) => setRequests(list.slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))))
      .catch(() => setRequests([]));

  useEffect(() => {
    load();
  }, []);

  const hasUnseen = requests?.some((r) => !r.seenByGuest) ?? false;

  const markAllRead = async () => {
    setMarking(true);
    try {
      await api.patch('/service-requests/mark-seen');
      await load();
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <h1 style={{ margin: 0 }}>{t('notifications.title')}</h1>
        {hasUnseen && (
          <button className="btn sm secondary" disabled={marking} onClick={markAllRead}>
            <CheckCheck size={14} /> {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        {requests === null && <p className="muted">{t('common.loading')}</p>}

        {requests !== null && requests.length === 0 && (
          <div className="empty-state">
            <div className="icon-wrap">
              <Bell size={24} />
            </div>
            <p>{t('notifications.empty')}</p>
          </div>
        )}

        {requests?.map((r) => (
          <RequestCard key={r._id} request={r} />
        ))}
      </div>
    </div>
  );
}
