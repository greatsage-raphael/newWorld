// --- src/components/offloading/truck-icon.ts ---

import L from 'leaflet';

// Simple truck SVG icon encoded as a data URI
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck">
  <path d="M10 17h4V5H2v12h3"/>
  <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/>
  <circle cx="7" cy="17" r="2"/>
  <circle cx="17" cy="17" r="2"/>
</svg>`;

const encodedIcon = `data:image/svg+xml;base64,${btoa(iconSvg)}`;

// A wrapper div to style the icon (e.g., circular background)
const iconHtml = `<div style="background-color: #16a34a; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);">${iconSvg}</div>`;


export const truckIcon = new L.DivIcon({
  html: iconHtml,
  className: '', // important to clear default styling
  iconSize: [32, 32],
  iconAnchor: [16, 16], // center of the icon
});