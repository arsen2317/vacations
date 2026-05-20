import { Card, Statistic, Divider, Typography } from 'antd'
import { useApp } from '../context/AppContext'

export default function BalanceCard() {
  const { balance } = useApp()

  return (
    <Card style={{ height: '100%' }}>
      <Typography.Text
        type="secondary"
        style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        Остаток дней
      </Typography.Text>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography.Text type="secondary" style={{ fontSize: 14 }}>Основной оплачиваемый</Typography.Text>
          <Statistic
            value={balance.main}
            suffix="дн."
            valueStyle={{ fontSize: 24, fontWeight: 700, color: '#111827' }}
          />
        </div>

        <Divider style={{ margin: 0 }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography.Text type="secondary" style={{ fontSize: 14 }}>Дополнительный</Typography.Text>
          <Statistic
            value={balance.extra}
            suffix="дн."
            valueStyle={{ fontSize: 24, fontWeight: 700, color: '#111827' }}
          />
        </div>
      </div>
    </Card>
  )
}
