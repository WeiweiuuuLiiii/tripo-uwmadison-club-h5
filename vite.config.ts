import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path for the GitHub Pages project site:
//   https://weiweiuuuliiii.github.io/tripo-uwmadison-club-h5/
// Overridable via VITE_BASE so the same build can target a root domain later.
const base = process.env.VITE_BASE ?? '/tripo-uwmadison-club-h5/'

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: 'es2018',
    cssCodeSplit: false,
    assetsInlineLimit: 4096,
  },
})
