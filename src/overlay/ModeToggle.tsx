import { switchMode } from '../lib/mode'

/** Always-visible mode switch. Immersive users can drop to the simple page;
 *  the Lite page shows the inverse (see LiteApp). This is a user PREFERENCE,
 *  never a forced/locked fallback. */
export function ModeToggle() {
  return (
    <button className="mode-toggle" onClick={() => switchMode('lite')} aria-label="切换到简洁模式">
      简洁模式
    </button>
  )
}
