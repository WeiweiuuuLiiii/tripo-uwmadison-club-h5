import { useState } from 'react'
import { requestGyroPermission, startGyro } from '../immersive/gyro'
import { useJourney } from '../immersive/store'

/**
 * Opt-in entry for device-orientation exploration. The 3D world already loaded;
 * this only turns on the gyro look-offset. Permission is requested INSIDE the
 * click handler (required by iOS). If denied / unsupported, the page keeps
 * running with finger-drag look and the entry stays available to retry.
 */
export function GyroButton() {
  const gyroOn = useJourney((s) => s.gyroOn)
  const setGyroOn = useJourney((s) => s.setGyroOn)
  const [status, setStatus] = useState<'idle' | 'toast' | 'denied'>('idle')

  if (typeof window !== 'undefined' && !('DeviceOrientationEvent' in window)) return null

  const enable = async () => {
    const ok = await requestGyroPermission()
    if (ok && startGyro()) {
      setGyroOn(true)
      setStatus('toast')
      window.setTimeout(() => setStatus('idle'), 2600)
    } else {
      setStatus('denied')
    }
  }

  if (gyroOn && status === 'toast') return <div className="gyro-toast" role="status">转动手机，探索空间</div>
  if (gyroOn) return null

  return (
    <button className="gyro-btn" onClick={enable} aria-label="开启陀螺仪空间探索">
      <span className="g-ic" aria-hidden="true">◎</span>
      <span className="g-tx">
        <b>{status === 'denied' ? '重新开启空间感' : '开启空间感'}</b>
        <i>GYRO EXPLORATION</i>
      </span>
    </button>
  )
}
