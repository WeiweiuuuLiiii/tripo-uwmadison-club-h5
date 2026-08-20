import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.css'
import './styles/global.css'
import App from './App'
import { prefersReducedMotion, qualityTier, resolveMode } from './lib/mode'

// Only opt into scroll-reveal (which briefly hides elements) when JS is running.
// Without this class the .reveal elements stay fully visible — so a JS/observer
// failure can never leave the page blank.
document.documentElement.classList.add('reveal-ready')

// Decide 3D vs Lite BEFORE React mounts, so CSS + the document background are
// correct on the very first paint. DEFAULT is 3D (see resolveMode). Reduced
// motion only calms the camera; quality tier scales dpr/textures, not the world.
const _mode = resolveMode()
document.documentElement.classList.add(_mode === 'lite' ? 'mode-lite' : 'mode-3d')
if (prefersReducedMotion()) document.documentElement.classList.add('reduced-motion')
document.documentElement.dataset.quality = qualityTier()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
