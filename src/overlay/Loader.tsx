/**
 * DOM loader — pure HTML/CSS, lives in the MAIN bundle (no three import) so it
 * paints within the first frame while the lazy 3D chunk downloads and WebGL
 * warms up. `progress` is optional: undefined = indeterminate shimmer (chunk
 * still loading), 0..100 = real asset progress from useProgress once mounted.
 */
export function Loader({ progress, done }: { progress?: number; done?: boolean }) {
  const pct = progress == null ? null : Math.min(100, Math.round(progress))
  return (
    <div className={`world-loader${done ? ' out' : ''}`} aria-hidden={done ? true : undefined}>
      <div className="wl-mark">
        <span className="wl-ring" />
        <span className="wl-ring d2" />
        <span className="wl-core" />
      </div>
      <div className="wl-label">INITIALIZING&nbsp;3D&nbsp;WORLD</div>
      <div className="wl-track">
        <div className="wl-fill" style={pct == null ? undefined : { width: `${pct}%` }} data-indeterminate={pct == null ? '' : undefined} />
      </div>
      <div className="wl-pct">{pct == null ? '· · ·' : `${pct}%`}</div>
    </div>
  )
}
