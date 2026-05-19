export const CURRENT_USER = {
  id: 1,
  name: 'Алексей Морозов',
  role: 'employee', // 'employee' | 'manager' | 'hr_admin'
  team: 'Продуктовая разработка',
  managerId: 2,
  balanceDays: 18,
  balanceExtra: 3,
}

export const CAMPAIGN = {
  active: true,
  year: 2026,
  totalDays: 28,
  distributedDays: 10,
}

export const UPCOMING_VACATION = {
  startDate: new Date(2026, 6, 14), // 14 июля
  endDate: new Date(2026, 6, 27),   // 27 июля
  status: 'approved',               // 'approved' | 'draft' | 'pending'
}

export const MY_REQUESTS = [
  {
    id: 1,
    type: 'planned',
    typeLabel: 'Плановый',
    startDate: new Date(2026, 6, 14),
    endDate: new Date(2026, 6, 27),
    days: 14,
    status: 'approved',
  },
  {
    id: 2,
    type: 'planned',
    typeLabel: 'Плановый',
    startDate: new Date(2026, 8, 1),
    endDate: new Date(2026, 8, 14),
    days: 14,
    status: 'approved',
  },
  {
    id: 3,
    type: 'unplanned',
    typeLabel: 'Внеплановый — ежегодный оплачиваемый',
    startDate: new Date(2026, 11, 22),
    endDate: new Date(2026, 11, 26),
    days: 5,
    status: 'pending',
  },
  {
    id: 4,
    type: 'unplanned',
    typeLabel: 'Внеплановый — без сохранения зарплаты',
    startDate: new Date(2025, 9, 3),
    endDate: new Date(2025, 9, 5),
    days: 3,
    status: 'rejected',
    rejectionComment: 'Период высокой нагрузки на команду',
  },
  {
    id: 5,
    type: 'planned',
    typeLabel: 'Плановый',
    startDate: new Date(2025, 4, 5),
    endDate: new Date(2025, 4, 18),
    days: 14,
    status: 'approved',
  },
]

export const STATUS_CONFIG = {
  draft:    { label: 'Черновик',        color: 'bg-gray-100 text-gray-600' },
  pending:  { label: 'На согласовании', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Согласована',     color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Отклонена',       color: 'bg-red-100 text-red-700' },
  cancelled:{ label: 'Отменена',        color: 'bg-gray-100 text-gray-500' },
}
