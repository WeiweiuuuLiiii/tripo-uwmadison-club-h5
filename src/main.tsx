import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/fonts.css'
import './styles/global.css'
import App from './App'

// Only opt into scroll-reveal (which briefly hides elements) when JS is running.
// Without this class the .reveal elements stay fully visible — so a JS/observer
// failure can never leave the page blank.
document.documentElement.classList.add('reveal-ready')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
