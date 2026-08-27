import L from 'leaflet';

// Simple colored-dot divIcons instead of Leaflet's default marker image — avoids the
// well-known bundler issue where Leaflet's default marker PNGs resolve to broken paths.
function dotIcon(color: string, size = 26) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(28,22,12,0.35);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export const hotelIcon = dotIcon('#066e60', 24);
export const placeIcon = dotIcon('#f2703c', 22);

const categoryHex: Record<string, string> = {
  restaurant: '#f2703c',
  cafe: '#f5a623',
  attraction: '#0ea894',
  service: '#8b5cf6',
};

export function categoryMarkerIcon(category: string) {
  return dotIcon(categoryHex[category] || '#f2703c', 22);
}

export const youIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:20px;height:20px;">
    <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(14,168,148,0.3);animation:you-pulse 2s ease-out infinite;"></div>
    <div style="width:20px;height:20px;border-radius:50%;background:#0ea894;border:3px solid white;box-shadow:0 2px 8px rgba(28,22,12,0.4);"></div>
  </div>
  <style>@keyframes you-pulse{0%{transform:scale(0.6);opacity:0.8;}100%{transform:scale(1.8);opacity:0;}}</style>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export function numberedIcon(n: number, done = false) {
  const bg = done ? '#0ea894' : '#f2703c';
  return L.divIcon({
    className: '',
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${bg};color:#fff;border:3px solid white;box-shadow:0 2px 8px rgba(28,22,12,0.35);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}
