'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom SVG pin matching Althea brand colors
const customPinSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64" width="30" height="40">
  <defs>
    <linearGradient id="pinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#00c4d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00a8b5;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#003d5c" flood-opacity="0.3"/>
    </filter>
  </defs>
  <path d="M24 0C10.745 0 0 10.745 0 24c0 18 24 40 24 40s24-22 24-40C48 10.745 37.255 0 24 0z"
        fill="url(#pinGrad)" filter="url(#shadow)"/>
  <circle cx="24" cy="22" r="10" fill="white" opacity="0.95"/>
  <circle cx="24" cy="22" r="5" fill="#00a8b5"/>
</svg>`;

const CustomIcon = L.divIcon({
  html: customPinSvg,
  className: 'custom-leaflet-pin',
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -36],
});

// Coordinates near "123 Avenue de la Santé, Paris" (13th arrondissement)
const POSITION: [number, number] = [48.8339, 2.3408];

export default function ContactMap() {
  return (
    <div className="group relative w-full rounded-2xl overflow-hidden shadow-lg border border-gray-100">
      {/* Map */}
      <div className="h-[360px]">
        <MapContainer
          center={POSITION}
          zoom={15}
          scrollWheelZoom={false}
          zoomControl={false}
          className="w-full h-full z-0"
        >
          {/* CartoDB Voyager — clean, modern, colorful */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <Marker position={POSITION} icon={CustomIcon}>
            <Popup className="althea-popup">
              <div className="font-sans">
                <p className="font-semibold text-[#003d5c] text-base leading-tight">Althea</p>
                <p className="text-gray-600 text-sm mt-1 leading-snug">
                  123 Avenue de la Sant&eacute;<br />
                  75013 Paris, France
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 px-5 py-3 flex items-center gap-3 z-[1000]">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#e0f7f9] flex items-center justify-center">
          <svg className="w-4 h-4 text-[#00a8b5]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0 1 15 0Z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#003d5c] truncate">123 Avenue de la Sant&eacute;, Paris</p>
          <p className="text-xs text-gray-500">75013 &mdash; 13e arrondissement</p>
        </div>
      </div>

      {/* Custom styles for Leaflet overrides */}
      <style>{`
        .custom-leaflet-pin {
          background: none !important;
          border: none !important;
        }
        .althea-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 24px -4px rgba(0, 61, 92, 0.15);
          border: 1px solid #e0f7f9;
          padding: 4px;
        }
        .althea-popup .leaflet-popup-tip {
          box-shadow: 0 4px 12px -2px rgba(0, 61, 92, 0.1);
          border: 1px solid #e0f7f9;
          border-top: none;
          border-left: none;
        }
        .althea-popup .leaflet-popup-content {
          margin: 10px 14px;
          font-family: var(--font-inter, 'Inter', sans-serif);
        }
        .althea-popup .leaflet-popup-close-button {
          color: #94a3b8 !important;
          font-size: 20px !important;
          top: 6px !important;
          right: 8px !important;
        }
        .althea-popup .leaflet-popup-close-button:hover {
          color: #00a8b5 !important;
        }
      `}</style>
    </div>
  );
}
