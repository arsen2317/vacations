import { useEffect } from 'react'
import { InfoIcon } from '../ds/index'

export default function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      zIndex: 2000, background: '#1D2023', color: '#FAFAFA', borderRadius: 16,
      padding: '14px 20px', fontSize: 15, fontFamily: "'MTSCompact', sans-serif",
      lineHeight: '22px', boxShadow: '0px 8px 24px rgba(0,0,0,0.20)',
      pointerEvents: 'none', whiteSpace: 'nowrap',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <InfoIcon color="#FAFAFA" />
      {message}
    </div>
  )
}
