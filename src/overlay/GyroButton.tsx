import { useState } from 'react'
import { recenter, requestGyroPermission, startGyro } from '../immersive/gyro'
import { useJourney } from '../immersive/store'

/**
 * Opt-in entry for device-orientation exploration. The 3D world already loaded;
 * this only turns on the gyro. Permission is requested INSIDE the click (iOS).
 * On enable it calibrates a neutral centre ("正在校准空间…") then invites the user
 * to move. A small "重新校准" control resets the centre without reloading. If
 * denied / unsupported, finger-drag look stays and the entry can be retried.
 */
export function GyroButton() {
  const gyroOn = useJourney((s) => s.gyroOn)
  const setGyroOn = useJourney((s) => s.setGyroOn)
  const [phase, setPhase] = useState<'idle' | 'denied' | 'calibrating' | 'ready' | 'on'>('idle')

  if (typeof window !== 'undefined' && !('DeviceOrientationEvent' in window)) return null

  const onStatus = (s: 'calibrating' | 'ready') => {
    if (s === 'ready') {
      setPhase('ready')
      window.setTimeout(() => setPhase('on'), 2400)
    } else {
      setPhase('calibrating')
    }
  }

  const enable = async () => {
    const ok = await requestGyroPermission()
    if (!ok) {
      setPhase('denied')
      return
    }
    setPhase('calibrating')
    if (!startGyro(onStatus)) {
      setPhase('denied')
      return
    }
    setGyroOn(true)
  }

  const recal = () => {
    setPhase('calibrating')
    recenter()
  }

  if (!gyroOn) {
    return (
      <button className="gyro-btn" onClick={enable} aria-label="开启陀螺仪空间探索">
        <span className="g-ic" aria-hidden="true">◎</span>
        <span className="g-tx">
          <b>{phase === 'denied' ? '重新开启空间感' : '开启空间感'}</b>
          <i>GYRO EXPLORATION</i>
        </span>
      </button>
    )
  }

  return (
    <>
      {phase === 'calibrating' && <div className="gyro-toast" role="status">正在校准空间…</div>}
      {phase === 'ready' && <div className="gyro-toast" role="status">转动手机，探索空间</div>}
      <button className="gyro-recal" onClick={recal} aria-label="重新校准空间中心">
        <span className="g-ic" aria-hidden="true">◎</span> 重新校准
      </button>
    </>
  )
}
