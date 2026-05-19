import CampaignBanner from '../components/CampaignBanner'
import VacationWidget from '../components/VacationWidget'
import BalanceCard from '../components/BalanceCard'

export default function EmployeeDashboard({ onGoToPlanning }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <CampaignBanner onGoToPlanning={onGoToPlanning} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <VacationWidget />
        <BalanceCard />
      </div>
    </div>
  )
}
