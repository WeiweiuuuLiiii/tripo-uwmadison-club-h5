import { useEffect } from 'react'

/**
 * Publishes the REAL visible viewport (accounting for the iOS Safari / WeChat
 * dynamic toolbars, the notch and Home indicator) into CSS variables, updated
 * live on toolbar show/hide, keyboard, zoom and orientation changes:
 *   --vvh     visualViewport.height (px)
 *   --vv-top  visualViewport.offsetTop (px)
 *   --vv-left visualViewport.offsetLeft (px)
 * The expanded HUD shell positions itself with these (never bare 100vh), so its
 * top always sits below the status bar and its bottom above the toolbar.
 */
export function useVisualViewport() {
  useEffect(() => {
    const vv = window.visualViewport
    const root = document.documentElement
    const update = () => {
      const h = vv ? vv.height : window.innerHeight
      root.style.setProperty('--vvh', `${Math.round(h)}px`)
      root.style.setProperty('--vv-top', `${Math.round(vv ? vv.offsetTop : 0)}px`)
      root.style.setProperty('--vv-left', `${Math.round(vv ? vv.offsetLeft : 0)}px`)
    }
    update()
    vv?.addEventListener('resize', update)
    vv?.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      vv?.removeEventListener('resize', update)
      vv?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])
}
