import { Fragment, KeyboardEvent, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Camera, Check, CheckCheck, ChevronDown, Clock3, Hotel, Image as ImageIcon, MessageCircle, Paperclip, Send, X } from 'lucide-react';
import { api, API_URL } from '../api/client';
import { ChatMessage } from '../api/types';
import { useLang } from '../context/LangContext';
import { compressImage } from '../utils/image';
import { useNotifications } from '../context/NotificationsContext';

// Real-time-ish delivery via short polling instead of Socket.io/WebSocket — the backend runs
// as a plain Node app behind Passenger in production, without persistent WS connections.
// A few seconds of latency is an acceptable trade-off for a hotel guest chat.
const POLL_MS = 3000;
const GROUP_GAP_MS = 5 * 60 * 1000;
const LOCALES: Record<string, string> = { ru: 'ru-RU', en: 'en-GB', uz: 'uz-UZ' };

interface PendingMessage {
  localId: string;
  text: string;
  file?: File;
  preview?: string;
  status: 'sending' | 'failed';
  timestamp: string;
}

type Row = { kind: 'server'; msg: ChatMessage } | { kind: 'pending'; msg: PendingMessage };

const photoUrl = (p: string) => (p.startsWith('http') || p.startsWith('blob:') ? p : `${API_URL}${p}`);
const isTouch = () => window.matchMedia('(pointer: coarse)').matches;
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

// Mobile keyboards shrink the *visual* viewport without resizing the layout (iOS), so the
// chat pins itself to visualViewport to keep the composer right above the keyboard.
function useVisualViewportVars() {
  useEffect(() => {
    const vv = window.visualViewport;
    const root = document.documentElement;
    document.body.classList.add('chat-open');
    const update = () => {
      if (!vv) return;
      root.style.setProperty('--vvh', `${vv.height}px`);
      root.style.setProperty('--vvtop', `${vv.offsetTop}px`);
    };
    update();
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      root.style.removeProperty('--vvh');
      root.style.removeProperty('--vvtop');
      document.body.classList.remove('chat-open');
    };
  }, []);
}

export function ChatPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const locale = LOCALES[lang] || 'ru-RU';
  const { refresh: refreshBadges } = useNotifications();

  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [text, setText] = useState('');
  const [attachOpen, setAttachOpen] = useState(false);
  const [draft, setDraft] = useState<{ file: File; url: string } | null>(null);
  const [caption, setCaption] = useState('');
  const [viewer, setViewer] = useState<string | null>(null);
  const [showDown, setShowDown] = useState(false);
  const [unseenBelow, setUnseenBelow] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const atBottomRef = useRef(true);
  const firstScrollRef = useRef(true);
  const sentRef = useRef(new Map<string, ChatMessage>());
  const prevCountRef = useRef(0);
  const touch = useRef(isTouch()).current;

  useVisualViewportVars();

  // Server list + messages we just sent that a poll may not include yet.
  const load = () =>
    api
      .get<ChatMessage[]>('/chat/messages')
      .then((list) => {
        const ids = new Set(list.map((m) => m._id));
        sentRef.current.forEach((_, id) => ids.has(id) && sentRef.current.delete(id));
        const merged = [...list, ...sentRef.current.values()];
        setMessages(merged);
        if (merged.some((m) => m.sender === 'admin' && !m.readStatus)) api.patch('/chat/messages/read').then(refreshBadges).catch(() => {});
      })
      .catch(() => setMessages((prev) => prev ?? []));

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const scrollToBottom = (smooth: boolean) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  const total = (messages?.length ?? 0) + pending.length;
  useLayoutEffect(() => {
    if (messages === null) return;
    const added = total - prevCountRef.current;
    prevCountRef.current = total;
    if (firstScrollRef.current) {
      firstScrollRef.current = false;
      scrollToBottom(false);
      return;
    }
    if (added <= 0) return;
    const last = pending.length ? null : messages[messages.length - 1];
    if (atBottomRef.current || pending.length || last?.sender === 'guest') {
      scrollToBottom(true);
    } else {
      setUnseenBelow((n) => n + added);
    }
  }, [total, messages === null]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    atBottomRef.current = atBottom;
    setShowDown(!atBottom);
    if (atBottom) setUnseenBelow(0);
  };

  // ---- sending ----

  const deliver = async (p: PendingMessage) => {
    setPending((prev) => prev.map((x) => (x.localId === p.localId ? { ...x, status: 'sending' } : x)));
    try {
      let photo: string | undefined;
      if (p.file) {
        const form = new FormData();
        form.append('file', await compressImage(p.file));
        photo = (await api.post<{ url: string }>('/upload/guest', form)).url;
      }
      const msg = await api.post<ChatMessage>('/chat/messages', { text: p.text, ...(photo ? { photo } : {}) });
      sentRef.current.set(msg._id, msg);
      setMessages((prev) => (prev?.some((m) => m._id === msg._id) ? prev : [...(prev ?? []), msg]));
      setPending((prev) => prev.filter((x) => x.localId !== p.localId));
      if (p.preview) setTimeout(() => URL.revokeObjectURL(p.preview!), 5000);
    } catch {
      setPending((prev) => prev.map((x) => (x.localId === p.localId ? { ...x, status: 'failed' } : x)));
    }
  };

  const enqueue = (value: string, file?: File, preview?: string) => {
    const p: PendingMessage = {
      localId: `${Date.now()}-${Math.random()}`,
      text: value,
      file,
      preview,
      status: 'sending',
      timestamp: new Date().toISOString(),
    };
    setPending((prev) => [...prev, p]);
    atBottomRef.current = true;
    deliver(p);
  };

  const sendText = () => {
    const value = text.trim();
    if (!value) return;
    setText('');
    enqueue(value);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Desktop: Enter sends, Shift+Enter is a new line. Phones keep Enter for new lines.
    if (e.key === 'Enter' && !e.shiftKey && !touch) {
      e.preventDefault();
      sendText();
    }
  };

  // Auto-grow the composer up to ~5 lines.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [text]);

  const openAttach = () => (touch ? setAttachOpen(true) : galleryRef.current?.click());

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setAttachOpen(false);
    if (!file) return;
    // Like Telegram: whatever was typed becomes the photo's caption.
    setCaption(text);
    setText('');
    setDraft({ file, url: URL.createObjectURL(file) });
  };

  const sendDraft = () => {
    if (!draft) return;
    enqueue(caption.trim(), draft.file, draft.url);
    setDraft(null);
    setCaption('');
  };

  const cancelDraft = () => {
    if (draft) URL.revokeObjectURL(draft.url);
    setText(caption);
    setDraft(null);
    setCaption('');
  };

  // ---- rendering ----

  const rows: Row[] = [
    ...(messages ?? []).map((msg) => ({ kind: 'server' as const, msg })),
    ...pending.map((msg) => ({ kind: 'pending' as const, msg })),
  ];
  const senderOf = (r: Row) => (r.kind === 'server' ? r.msg.sender : 'guest');
  const timeOf = (r: Row) => new Date(r.msg.timestamp);

  const dayLabel = (d: Date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (sameDay(d, now)) return t('chat.today');
    if (sameDay(d, yesterday)) return t('chat.yesterday');
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}) });
  };

  const formatTime = (d: Date) => d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="tg-chat">
      <header className="tg-header">
        <button type="button" className="tg-icon-btn" onClick={() => navigate('/')} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div className="tg-avatar">
          <Hotel size={20} />
        </div>
        <div className="tg-header__text">
          <div className="tg-header__title">{t('chat.title')}</div>
          <div className="tg-header__sub">{t('chat.subtitle')}</div>
        </div>
      </header>

      <div className="tg-messages" ref={listRef} onScroll={onScroll}>
        <div className="tg-messages__inner">
          {messages === null && <div className="tg-system">{t('common.loading')}</div>}

          {messages !== null && rows.length === 0 && (
            <div className="tg-empty">
              <div className="tg-empty__icon">
                <MessageCircle size={28} />
              </div>
              <div className="tg-empty__title">{t('chat.title')}</div>
              <p>{t('chat.empty')}</p>
            </div>
          )}

          {rows.map((row, i) => {
            const prev = rows[i - 1];
            const next = rows[i + 1];
            const time = timeOf(row);
            const sender = senderOf(row);
            const newDay = !prev || !sameDay(timeOf(prev), time);
            const groupedWithNext =
              !!next && senderOf(next) === sender && sameDay(timeOf(next), time) && +timeOf(next) - +time < GROUP_GAP_MS;
            const out = sender === 'guest';
            const photo = row.kind === 'server' ? row.msg.photo : row.msg.preview;
            const body = row.msg.text;
            const failed = row.kind === 'pending' && row.msg.status === 'failed';

            const meta = (
              <span className={`tg-meta ${!body && photo ? 'on-photo' : ''}`}>
                {formatTime(time)}
                {out &&
                  (row.kind === 'pending' ? (
                    failed ? <AlertCircle size={14} /> : <Clock3 size={13} />
                  ) : row.msg.readStatus ? (
                    <CheckCheck size={15} />
                  ) : (
                    <Check size={15} />
                  ))}
              </span>
            );

            return (
              <Fragment key={row.kind === 'server' ? row.msg._id : row.msg.localId}>
                {newDay && (
                  <div className="tg-day">
                    <span>{dayLabel(time)}</span>
                  </div>
                )}
                <div className={`tg-row ${out ? 'out' : 'in'} ${groupedWithNext ? 'grouped' : ''}`}>
                  <div
                    className={`tg-bubble ${groupedWithNext ? '' : 'tail'} ${photo ? 'has-photo' : ''} ${failed ? 'failed' : ''}`}
                    onClick={failed ? () => deliver(row.msg as PendingMessage) : undefined}
                  >
                    {photo && (
                      <button type="button" className="tg-photo" onClick={() => !failed && setViewer(photoUrl(photo))}>
                        <img
                          src={photoUrl(photo)}
                          alt=""
                          onLoad={() => atBottomRef.current && scrollToBottom(false)}
                        />
                        {row.kind === 'pending' && row.msg.status === 'sending' && <span className="tg-photo__spinner" />}
                        {!body && meta}
                      </button>
                    )}
                    {body && (
                      <div className="tg-text">
                        {body}
                        {meta}
                      </div>
                    )}
                  </div>
                </div>
                {failed && <div className="tg-failed">{t('chat.sendError')}</div>}
              </Fragment>
            );
          })}
        </div>
      </div>

      {showDown && (
        <button type="button" className="tg-down" onClick={() => scrollToBottom(true)} aria-label={t('chat.newMessages')}>
          <ChevronDown size={22} />
          {unseenBelow > 0 && <span className="tg-down__badge">{unseenBelow}</span>}
        </button>
      )}

      <div className="tg-composer">
        <button type="button" className="tg-icon-btn" onClick={openAttach} aria-label={t('chat.gallery')}>
          <Paperclip size={22} />
        </button>
        <textarea
          ref={inputRef}
          className="tg-input"
          rows={1}
          placeholder={t('chat.placeholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          enterKeyHint={touch ? 'enter' : 'send'}
        />
        {text.trim() ? (
          <button type="button" className="tg-send" onClick={sendText} aria-label={t('chat.send')}>
            <Send size={19} />
          </button>
        ) : touch ? (
          <button type="button" className="tg-icon-btn" onClick={() => cameraRef.current?.click()} aria-label={t('chat.camera')}>
            <Camera size={22} />
          </button>
        ) : (
          <button type="button" className="tg-send" disabled aria-label={t('chat.send')}>
            <Send size={19} />
          </button>
        )}
      </div>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onPick} />
      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={onPick} />

      {attachOpen &&
        createPortal(
          <div className="tg-sheet-overlay" onClick={() => setAttachOpen(false)}>
            <div className="tg-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="tg-sheet__group">
                <button type="button" onClick={() => cameraRef.current?.click()}>
                  <span className="tg-sheet__icon blue">
                    <Camera size={20} />
                  </span>
                  {t('chat.camera')}
                </button>
                <button type="button" onClick={() => galleryRef.current?.click()}>
                  <span className="tg-sheet__icon green">
                    <ImageIcon size={20} />
                  </span>
                  {t('chat.gallery')}
                </button>
              </div>
              <button type="button" className="tg-sheet__cancel" onClick={() => setAttachOpen(false)}>
                {t('chat.cancel')}
              </button>
            </div>
          </div>,
          document.body,
        )}

      {draft &&
        createPortal(
          <div className="tg-preview">
            <div className="tg-preview__top">
              <button type="button" className="tg-preview__close" onClick={cancelDraft} aria-label={t('chat.cancel')}>
                <X size={24} />
              </button>
            </div>
            <div className="tg-preview__media">
              <img src={draft.url} alt="" />
            </div>
            <div className="tg-preview__bar">
              <textarea
                className="tg-input dark"
                rows={1}
                autoFocus={!touch}
                placeholder={t('chat.caption')}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !touch) {
                    e.preventDefault();
                    sendDraft();
                  }
                }}
              />
              <button type="button" className="tg-send" onClick={sendDraft} aria-label={t('chat.send')}>
                <Send size={19} />
              </button>
            </div>
          </div>,
          document.body,
        )}

      {viewer &&
        createPortal(
          <div className="tg-viewer" onClick={() => setViewer(null)}>
            <button type="button" className="tg-preview__close" aria-label="Close">
              <X size={24} />
            </button>
            <img src={viewer} alt="" />
          </div>,
          document.body,
        )}
    </div>
  );
}
