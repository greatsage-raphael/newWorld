import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'
import 'leaflet/dist/leaflet.css';

// --- FINAL, CORRECTED IMPORTS BASED ON YOUR FILE STRUCTURE ---
// REMOVE ANY PREVIOUS ATTEMPTS

// ADD these two lines which match your screenshot
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';


const PUBLISHABLE_KEY = "pk_test_dG91Y2hpbmctaGFkZG9jay01Ni5jbGVyay5hY2NvdW50cy5kZXYk"

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key")
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
);