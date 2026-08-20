import { Component, Suspense, lazy, useCallback, useState, type ReactNode } from 'react'
import LiteApp from './lite/LiteApp'
import { Loader } from './overlay/Loader'
import { resolveMode, switchMode, type Mode } from './lib/mode'

// The whole three/R3F world is a separate async chunk (see vite manualChunks),
// so it never blocks first paint. The DOM Loader below shows meanwhile.
const ImmersiveApp = lazy(() => import('./immersive/ImmersiveApp'))

/** Catches any render/runtime error in the immersive tree → shows the fail UI. */
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

/** Shown when 3D fails at runtime. NO permanent lock — user chooses. */
function FailOverlay() {
  return (
    <div className="fail-overlay">
      <div className="fail-card">
        <div className="fail-title">3D 世界加载遇到问题</div>
        <p className="fail-sub">你的设备或网络可能暂时无法运行沉浸式 3D。你可以重试，或使用简洁模式浏览全部内容。</p>
        <div className="fail-btns">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            重试 3D 模式
          </button>
          <button className="btn btn-ghost" onClick={() => switchMode('lite')}>
            进入简洁模式
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [mode] = useState<Mode>(() => resolveMode())
  const [failed, setFailed] = useState(false)
  const onFail = useCallback(() => setFailed(true), [])

  if (mode === 'lite') return <LiteApp onEnter3D={() => switchMode('3d')} />

  return (
    <>
      <ImmersiveBoundary onFail={onFail}>
        <Suspense fallback={<Loader />}>
          <ImmersiveApp onFail={onFail} />
        </Suspense>
      </ImmersiveBoundary>
      {failed && <FailOverlay />}
    </>
  )
}
