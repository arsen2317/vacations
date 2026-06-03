import { useState } from 'react'

const KEY = 'vac_access'
const PASSWORD = import.meta.env.VITE_PASSWORD || 'mts2026'

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(KEY) === '1')
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return children

  function submit(e) {
    e.preventDefault()
    if (input === PASSWORD) {
      localStorage.setItem(KEY, '1')
      setUnlocked(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F2F3F7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'MTSCompact', sans-serif",
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '40px 32px',
        width: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1D2023', lineHeight: '28px' }}>
            Прототип
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: '#626C77', lineHeight: '20px' }}>
            Введите пароль для доступа
          </p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            placeholder="Пароль"
            autoFocus
            style={{
              padding: '12px 16px',
              fontSize: 14,
              fontFamily: "'MTSCompact', sans-serif",
              border: `1px solid ${error ? '#E30611' : 'rgba(188,195,208,0.5)'}`,
              borderRadius: 8,
              outline: 'none',
              color: '#1D2023',
              background: '#fff',
            }}
          />
          {error && (
            <span style={{ fontSize: 12, color: '#E30611' }}>Неверный пароль</span>
          )}
          <button
            type="submit"
            style={{
              background: '#0066FF',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '14px',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontFamily: "'MTSWide', sans-serif",
              cursor: 'pointer',
            }}
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  )
}
