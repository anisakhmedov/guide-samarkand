import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Eraser, PenLine } from 'lucide-react';

export interface SignaturePadHandle {
  clear: () => void;
  /** PNG data URL (transparent background, cropped to the strokes), or null when empty. */
  toDataUrl: () => string | null;
}

interface SignaturePadProps {
  placeholder: string;
  clearLabel: string;
  onChange: (hasInk: boolean) => void;
}

const INK = '#1b2a4a';
const MAX_EXPORT_WIDTH = 600;

// Finger / mouse / stylus signature. Pointer events + `touch-action: none` so drawing never
// scrolls the page; strokes are smoothed with quadratic curves through segment midpoints.
export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(function SignaturePad({ placeholder, clearLabel, onChange }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<{ x: number; y: number }[][]>([]);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const setInk = (ink: boolean) => {
    setHasInk(ink);
    onChangeRef.current(ink);
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const pts of strokes.current) {
      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, 1.4, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }
  };

  // Keep the backing store matched to the element size × devicePixelRatio (crisp lines).
  useEffect(() => {
    const canvas = canvasRef.current!;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      redraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  useImperativeHandle(ref, () => ({
    clear: () => {
      strokes.current = [];
      redraw();
      setInk(false);
    },
    toDataUrl: () => {
      const pts = strokes.current.flat();
      if (!pts.length) return null;
      const pad = 8;
      const minX = Math.max(0, Math.min(...pts.map((p) => p.x)) - pad);
      const minY = Math.max(0, Math.min(...pts.map((p) => p.y)) - pad);
      const maxX = Math.max(...pts.map((p) => p.x)) + pad;
      const maxY = Math.max(...pts.map((p) => p.y)) + pad;
      const w = maxX - minX;
      const h = maxY - minY;
      const scale = Math.min(2, MAX_EXPORT_WIDTH / w);
      const out = document.createElement('canvas');
      out.width = Math.max(1, Math.round(w * scale));
      out.height = Math.max(1, Math.round(h * scale));
      const dpr = window.devicePixelRatio || 1;
      out.getContext('2d')!.drawImage(canvasRef.current!, minX * dpr, minY * dpr, w * dpr, h * dpr, 0, 0, out.width, out.height);
      return out.toDataURL('image/png');
    },
  }));

  return (
    <div className={`signature-pad ${hasInk ? 'has-ink' : ''}`}>
      <canvas
        ref={canvasRef}
        className="signature-pad__canvas"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          strokes.current.push([point(e)]);
          redraw();
          setInk(true);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          strokes.current[strokes.current.length - 1].push(point(e));
          redraw();
        }}
        onPointerUp={() => (drawing.current = false)}
        onPointerCancel={() => (drawing.current = false)}
      />
      <div className="signature-pad__line" />
      <div className="signature-pad__hint">
        <PenLine size={14} /> {placeholder}
      </div>
      <button
        type="button"
        className="signature-pad__clear"
        onClick={() => {
          strokes.current = [];
          redraw();
          setInk(false);
        }}
      >
        <Eraser size={14} /> {clearLabel}
      </button>
    </div>
  );
});
