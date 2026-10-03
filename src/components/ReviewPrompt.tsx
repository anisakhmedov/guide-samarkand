import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ExternalLink, Heart, Star } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { reviewState, useDiscountPercent, withPercent } from '../hooks/useReviewOffer';

const FIRST_VISIT_KEY = 'guide_first_visit_at';
const SESSION_KEY = 'guide_review_prompt_checked';
const SHOW_DELAY_MS = 2500;

const storage = {
  get: (s: Storage, k: string) => {
    try {
      return s.getItem(k);
    } catch {
      return null;
    }
  },
  set: (s: Storage, k: string, v: string) => {
    try {
      s.setItem(k, v);
    } catch {
      // private mode — prompt simply behaves as if every visit were the first
    }
  },
};

// Decided once per page load (not per effect run, which React may repeat).
let askThisVisit: boolean | null = null;
function shouldAskThisVisit() {
  if (askThisVisit !== null) return askThisVisit;
  if (storage.get(sessionStorage, SESSION_KEY)) return (askThisVisit = false); // already asked in this visit
  storage.set(sessionStorage, SESSION_KEY, '1');
  if (!storage.get(localStorage, FIRST_VISIT_KEY)) {
    storage.set(localStorage, FIRST_VISIT_KEY, new Date().toISOString());
    return (askThisVisit = false); // first visit — don't ask yet
  }
  return (askThisVisit = true);
}

/**
 * "Leave us a review" sheet. Not part of registration any more: the first visit to the app
 * is left alone, and from the next visit (a new browser session) on the guest is asked once
 * per visit until they confirm they left one. "Later" just waits for the next visit.
 */
export function ReviewPrompt() {
  const { t } = useLang();
  const { guest, reviewLinks, markReviewSubmitted } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const [sending, setSending] = useState(false);
  const [thanks, setThanks] = useState(false);

  const percent = useDiscountPercent();
  const eligible = guest?.accessStatus === 'open' && reviewState(guest) === 'not_sent';

  useEffect(() => {
    if (!eligible || !shouldAskThisVisit()) return;
    const id = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(id);
  }, [eligible]);

  // Never cover the full-screen chat composer.
  const visible = open && pathname !== '/chat';
  const links = [
    { href: reviewLinks?.google, label: 'Google Maps' },
    { href: reviewLinks?.yandex, label: 'Яндекс.Карты' },
    { href: reviewLinks?.twoGis, label: '2ГИС' },
  ].filter((l) => !!l.href);

  const confirm = async () => {
    setSending(true);
    try {
      await markReviewSubmitted();
      setThanks(true);
      setTimeout(() => setOpen(false), 1800);
    } catch {
      setOpen(false);
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div className="review-prompt-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.div
            className="review-prompt"
            role="dialog"
            aria-labelledby="review-prompt-title"
            initial={{ y: 60, opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {thanks ? (
              <div className="review-prompt__thanks">
                <CheckCircle2 size={40} />
                <div>{t('reviewPrompt.thanks')}</div>
              </div>
            ) : (
              <>
                <div className="review-prompt__stars" aria-hidden>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={26} fill="currentColor" />
                  ))}
                </div>
                <h2 id="review-prompt-title">{t('reviewPrompt.title')}</h2>
                {percent ? <span className="review-offer__badge">{withPercent(t('review.badge'), percent)}</span> : null}
                <p>{withPercent(t(percent ? 'review.offer' : 'review.offerNoDiscount'), percent)}</p>
                {percent ? <p className="review-prompt__note">{t('review.discountNote')}</p> : null}

                <div className="review-prompt__links">
                  {links.map((l) => (
                    <a key={l.label} className="btn secondary" href={l.href} target="_blank" rel="noreferrer" onClick={() => setOpened(true)}>
                      {l.label} <ExternalLink size={14} />
                    </a>
                  ))}
                </div>

                <button type="button" className={`btn block ${opened ? '' : 'secondary'}`} disabled={sending} onClick={confirm}>
                  <Heart size={16} /> {t('reviewPrompt.done')}
                </button>
                <button type="button" className="btn ghost block" onClick={() => setOpen(false)}>
                  {t('reviewPrompt.later')}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
