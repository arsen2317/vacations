import { Typography, Button } from 'antd'
import { PictureOutlined } from '@ant-design/icons'
import { UPCOMING_VACATION } from '../data/mockData'

function getDaysUntil(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = date - today
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(date) {
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export default function VacationWidget() {
  const vacation = UPCOMING_VACATION
  const daysUntil = getDaysUntil(vacation.startDate)
  const duration = Math.ceil((vacation.endDate - vacation.startDate) / (1000 * 60 * 60 * 24)) + 1

  return (
    <div style={{
      position: 'relative',
      borderRadius: 8,
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #3b82f6 100%)',
      color: '#fff',
      padding: 24,
      minHeight: 180,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <div style={{ position: 'absolute', top: -32, right: -32, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ position: 'absolute', bottom: -48, left: -24, width: 192, height: 192, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

      <div style={{ position: 'relative' }}>
        <Typography.Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
          Ближайший отпуск
        </Typography.Text>
        <Typography.Text style={{ color: '#fff', fontWeight: 600, fontSize: 16, display: 'block', marginTop: 4 }}>
          {formatDate(vacation.startDate)} — {formatDate(vacation.endDate)}
        </Typography.Text>
        <Typography.Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, display: 'block', marginTop: 2 }}>
          {duration} дней
        </Typography.Text>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1, color: '#fff' }}>{daysUntil}</div>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4, display: 'block' }}>
            {daysUntil === 1 ? 'день до отпуска' : daysUntil < 5 ? 'дня до отпуска' : 'дней до отпуска'}
          </Typography.Text>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.2)',
          border: '2px dashed rgba(255,255,255,0.4)',
          borderRadius: 12,
          width: 56,
          height: 56,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          gap: 2,
        }}>
          <PictureOutlined style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)' }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Обложка</span>
        </div>
      </div>
    </div>
  )
}
