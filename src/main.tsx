import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.css'
import './styles/global.css'
import App from './App'
import { detectLite } from './lib/detectLite'

// Only opt into scroll-reveal (which briefly hides elements) when JS is running.
// Without this class the .reveal elements stay fully visible — so a JS/observer
// failure can never leave the page blank.
document.documentElement.classList.add('reveal-ready')

// Decide 3D vs Lite BEFORE React mounts, so CSS (.mode-3d / .mode-lite) and the
// document background are correct on the very first paint. App re-reads the same
// deterministic signal; the runtime watchdog can still flip us to Lite later.
document.documentElement.classList.add(detectLite() ? 'mode-lite' : 'mode-3d')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
