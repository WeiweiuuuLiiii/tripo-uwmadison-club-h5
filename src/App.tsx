import { Component, Suspense, lazy, useCallback, useState, type ReactNode } from 'react'
import LiteApp from './lite/LiteApp'
import { Loader } from './overlay/Loader'
import { detectLite, stickLite } from './lib/detectLite'

// The whole three/R3F world is a separate async chunk (see vite manualChunks),
// so it never blocks first paint. The DOM Loader below shows meanwhile.
const ImmersiveApp = lazy(() => import('./immersive/ImmersiveApp'))

/**
 * Catches ANY render/runtime error thrown inside the immersive tree and hands
 * control to Lite mode — the signup path can never be taken down by a WebGL bug.
 */
class ImmersiveBoundary extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function App() {
  const [lite, setLite] = useState<boolean>(() => detectLite())
  const goLite = useCallback(() => {
    stickLite()
    setLite(true)
  }, [])

  if (lite) return <LiteApp />

  return (
    <ImmersiveBoundary onFail={goLite}>
      <Suspense fallback={<Loader />}>
        <ImmersiveApp goLite={goLite} />
      </Suspense>
    </ImmersiveBoundary>
  )
}
