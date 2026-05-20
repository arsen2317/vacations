import { Alert, Button } from 'antd'
import { useApp } from '../context/AppContext'

export default function CampaignBanner({ onGoToPlanning }) {
  const { campaign, segments } = useApp()
  const distributedDays = segments.reduce((acc, s) => acc + s.days, 0)
  const remaining = campaign.totalDays - distributedDays

  if (campaign.active) {
    return (
      <Alert
        type="info"
        showIcon
        message={`Идёт кампания по планированию отпусков на ${campaign.year} год`}
        description={
          <>
            Нераспределено:{' '}
            <strong>{remaining} из {campaign.totalDays} дней</strong>
            {' — '}
            {remaining > 0
              ? 'распределите все дни и отправьте план на согласование'
              : 'все дни распределены, можно отправлять на согласование'
            }
          </>
        }
        action={
          onGoToPlanning && (
            <Button size="small" onClick={onGoToPlanning}>
              Перейти к планированию
            </Button>
          )
        }
      />
    )
  }

  return (
    <Alert
      type="warning"
      showIcon
      message="Кампания по планированию не активна"
      description="Внеплановые заявки доступны в любое время"
    />
  )
}
