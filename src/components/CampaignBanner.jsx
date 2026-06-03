import { Banner, BreadChevron } from '../ds/index'
import { useApp } from '../context/AppContext'

export default function CampaignBanner({ onGoToPlanning }) {
  const { campaign, segments } = useApp()
  const distributedDays = segments.reduce((acc, s) => acc + s.days, 0)
  const remaining = campaign.totalDays - distributedDays

  const title = campaign.active
    ? `Идёт кампания по планированию отпусков на ${campaign.year} год`
    : 'Кампания по планированию не активна'

  const subtitle = campaign.active
    ? remaining > 0
      ? `Распределите все дни и отправьте план на согласование до 19 декабря ${campaign.year - 1} года`
      : 'Все дни распределены — отправьте план на согласование'
    : 'Внеплановые заявки доступны в любое время'

  return (
    <div
      style={{ position: 'relative', cursor: onGoToPlanning ? 'pointer' : 'default' }}
      onClick={onGoToPlanning}
    >
      <Banner type="info" title={title} subtitle={subtitle} />
      {onGoToPlanning && (
        <div style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}>
          <BreadChevron />
        </div>
      )}
    </div>
  )
}
