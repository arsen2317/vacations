export const CURRENT_USER = {
  id: 1,
  name: 'Алексей Морозов',
  avatar: '/avatars/mikhail.webp',
  role: 'employee',
  team: 'Продуктовая разработка',
  managerId: 2,
  balanceDays: 18,
  balanceExtra: 3,
  balanceAccumulated: 12,
}

export const CAMPAIGN = {
  active: true,
  year: 2027,
  totalDays: 28,
}

export const UPCOMING_VACATION = {
  startDate: new Date(2026, 6, 14),
  endDate: new Date(2026, 6, 27),
  status: 'approved',
}

export const MY_REQUESTS = [
  // Плановые — 28 дней суммарно, согласованы
  {
    id: 101,
    type: 'planned',
    typeLabel: 'Плановый',
    planCategory: 'Плановый',
    startDate: new Date(2026, 2, 9),   // 9 марта
    endDate:   new Date(2026, 2, 22),  // 22 марта
    days: 14,
    status: 'approved',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
    rescheduleCount: 0,
    rescheduleLimit: 2,
  },
  {
    id: 102,
    type: 'planned',
    typeLabel: 'Плановый',
    planCategory: 'Плановый',
    startDate: new Date(2026, 7, 3),   // 3 августа
    endDate:   new Date(2026, 7, 12),  // 12 августа
    days: 10,
    status: 'approved',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
    rescheduleCount: 0,
    rescheduleLimit: 2,
  },
  {
    id: 103,
    type: 'planned',
    typeLabel: 'Плановый',
    planCategory: 'Плановый',
    startDate: new Date(2026, 10, 2),  // 2 ноября
    endDate:   new Date(2026, 10, 5),  // 5 ноября
    days: 4,
    status: 'approved',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
    rescheduleCount: 0,
    rescheduleLimit: 2,
  },
  // Внеплановый — на согласовании
  {
    id: 201,
    type: 'unplanned',
    typeLabel: 'Внеплановый',
    planCategory: 'Внеплановый',
    startDate: new Date(2026, 5, 15),  // 15 июня
    endDate:   new Date(2026, 5, 19),  // 19 июня
    days: 5,
    status: 'pending',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
  },
  // Внеплановый — отклонён
  {
    id: 202,
    type: 'unplanned',
    typeLabel: 'Внеплановый',
    planCategory: 'Внеплановый',
    startDate: new Date(2026, 3, 20),  // 20 апреля
    endDate:   new Date(2026, 3, 24),  // 24 апреля
    days: 5,
    status: 'rejected',
    rejectionComment: 'Период высокой нагрузки на команду',
    approver: { name: 'Дмитрий Соколов', role: 'Руководитель' },
  },
]

export const STATUS_CONFIG = {
  draft:      { label: 'Черновик',          color: 'bg-gray-100 text-gray-600' },
  pending:    { label: 'На согласовании',   color: 'bg-amber-100 text-amber-700' },
  reviewing:  { label: 'На ознакомлении',   color: 'bg-orange-100 text-orange-700' },
  approved:   { label: 'Согласована',       color: 'bg-green-100 text-green-700' },
  rejected:   { label: 'Отклонена',         color: 'bg-red-100 text-red-700' },
  cancelled:  { label: 'Отменена',         color: 'bg-gray-100 text-gray-500' },
}

export const HOLIDAYS_2026 = new Set([
  '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05',
  '2026-01-06', '2026-01-07', '2026-01-08',
  '2026-02-23',
  '2026-03-09',
  '2026-05-01',
  '2026-05-11',
  '2026-06-12',
  '2026-11-04',
])

export const HOLIDAYS_2027 = new Set([
  '2027-01-01', '2027-01-04', '2027-01-05', '2027-01-06', '2027-01-07', '2027-01-08',
  '2027-02-22', '2027-02-23',
  '2027-03-08',
  '2027-05-03', '2027-05-10',
  '2027-06-14',
  '2027-11-04', '2027-11-05',
  '2027-12-31',
])

export const INITIAL_SEGMENTS = []

export const APPROVED_SEGMENTS = [
  {
    id: 101,
    startDate: '2027-07-14',
    endDate: '2027-07-27',
    days: 14,
  },
  {
    id: 102,
    startDate: '2027-09-01',
    endDate: '2027-09-14',
    days: 14,
  },
]

export const COLLEAGUES = [
  {
    id: 1,
    name: 'Алексей Морозов',
    patronymic: 'Иванович',
    avatar: '/avatars/mikhail.webp',
    me: true,
    position: 'Backend-разработчик',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-03-09', endDate: '2026-03-22', status: 'approved' },
      { startDate: '2026-08-03', endDate: '2026-08-12', status: 'approved' },
      { startDate: '2026-11-02', endDate: '2026-11-05', status: 'approved' },
    ],
  },
  {
    id: 2,
    name: 'Дмитрий Соколов',
    patronymic: 'Александрович',
    avatar: '/avatars/egor.webp',
    position: 'Руководитель',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-06-01', endDate: '2026-06-14', status: 'approved' },
      { startDate: '2026-10-05', endDate: '2026-10-18', status: 'approved' },
      { startDate: '2027-03-08', endDate: '2027-03-21', status: 'approved' },
      { startDate: '2027-08-02', endDate: '2027-08-15', status: 'pending' },
    ],
  },
  {
    id: 3,
    name: 'Мария Иванова',
    patronymic: 'Сергеевна',
    avatar: '/avatars/maria.webp',
    position: 'Frontend-разработчик',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-08-04', endDate: '2026-08-17', status: 'approved' },
      { startDate: '2026-11-10', endDate: '2026-11-23', status: 'approved' },
      { startDate: '2027-02-01', endDate: '2027-02-14', status: 'draft' },
      { startDate: '2027-06-07', endDate: '2027-06-20', status: 'approved' },
    ],
  },
  {
    id: 4,
    name: 'Анна Петрова',
    patronymic: 'Николаевна',
    avatar: '/avatars/sofia.webp',
    position: 'Аналитик',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-03-02', endDate: '2026-03-15', status: 'approved' },
      { startDate: '2026-07-20', endDate: '2026-08-02', status: 'approved' },
      { startDate: '2027-04-05', endDate: '2027-04-18', status: 'pending' },
      { startDate: '2027-10-04', endDate: '2027-10-17', status: 'approved' },
    ],
  },
  {
    id: 5,
    name: 'Игорь Смирнов',
    patronymic: 'Петрович',
    avatar: '/avatars/manokhin.webp',
    position: 'UI/UX-дизайнер',
    team: 'Дизайн',
    segments: [
      { startDate: '2026-05-25', endDate: '2026-06-07', status: 'approved' },
      { startDate: '2026-08-24', endDate: '2026-09-06', status: 'approved' },
      { startDate: '2027-03-22', endDate: '2027-04-04', status: 'approved' },
      { startDate: '2027-09-13', endDate: '2027-09-26', status: 'draft' },
    ],
  },
  {
    id: 6,
    name: 'Сергей Николаев',
    patronymic: 'Владимирович',
    avatar: '/avatars/konstantin.webp',
    position: 'QA-инженер',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-06-15', endDate: '2026-06-28', status: 'approved' },
      { startDate: '2027-01-18', endDate: '2027-01-31', status: 'draft' },
      { startDate: '2027-07-05', endDate: '2027-07-18', status: 'pending' },
    ],
  },
  {
    id: 7,
    name: 'Елена Козлова',
    patronymic: 'Михайловна',
    avatar: '/avatars/marina.webp',
    position: 'Аналитик',
    team: 'Продуктовая разработка',
    segments: [
      { startDate: '2026-07-01', endDate: '2026-07-14', status: 'approved' },
      { startDate: '2026-10-12', endDate: '2026-10-25', status: 'approved' },
      { startDate: '2027-05-17', endDate: '2027-05-30', status: 'approved' },
      { startDate: '2027-11-08', endDate: '2027-11-21', status: 'pending' },
    ],
  },
]

export const SUBORDINATES = [
  {
    id: 3,
    name: 'Мария Иванова',
    avatar: '/avatars/maria.webp',
    position: 'Frontend-разработчик',
    team: 'Продуктовая разработка',
    planStatus: 'pending',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-08-04', endDate: '2026-08-17', days: 14 },
      { startDate: '2026-11-10', endDate: '2026-11-23', days: 14 },
    ],
  },
  {
    id: 4,
    name: 'Анна Петрова',
    avatar: '/avatars/sofia.webp',
    position: 'Backend-разработчик',
    team: 'Продуктовая разработка',
    planStatus: 'pending',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-03-02', endDate: '2026-03-15', days: 14 },
      { startDate: '2026-07-20', endDate: '2026-08-02', days: 14 },
    ],
  },
  {
    id: 6,
    name: 'Сергей Николаев',
    avatar: '/avatars/konstantin.webp',
    position: 'QA-инженер',
    team: 'Продуктовая разработка',
    planStatus: 'draft',
    distributedDays: 14,
    totalDays: 28,
    segments: [
      { startDate: '2026-06-15', endDate: '2026-06-28', days: 14 },
    ],
  },
  {
    id: 7,
    name: 'Елена Козлова',
    position: 'Аналитик',
    team: 'Продуктовая разработка',
    planStatus: 'approved',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-07-01', endDate: '2026-07-14', days: 14 },
      { startDate: '2026-10-12', endDate: '2026-10-25', days: 14 },
    ],
  },
  {
    id: 5,
    name: 'Игорь Смирнов',
    avatar: '/avatars/manokhin.webp',
    position: 'UI/UX-дизайнер',
    team: 'Дизайн',
    planStatus: 'approved',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-05-25', endDate: '2026-06-07', days: 14 },
      { startDate: '2026-08-24', endDate: '2026-09-06', days: 14 },
    ],
  },
  {
    id: 8,
    name: 'Ольга Васильева',
    avatar: '/avatars/olga.webp',
    position: 'Графический дизайнер',
    team: 'Дизайн',
    planStatus: 'pending',
    distributedDays: 28,
    totalDays: 28,
    segments: [
      { startDate: '2026-06-22', endDate: '2026-07-05', days: 14 },
      { startDate: '2026-09-14', endDate: '2026-09-27', days: 14 },
    ],
  },
]

export const ALL_EMPLOYEES = [
  { id: 1,  name: 'Алексей Морозов',  avatar: '/avatars/mikhail.webp',    team: 'Продуктовая разработка', planStatus: 'approved' },
  { id: 2,  name: 'Дмитрий Соколов',  avatar: '/avatars/egor.webp',       team: 'Продуктовая разработка', planStatus: 'approved' },
  { id: 3,  name: 'Мария Иванова',    avatar: '/avatars/maria.webp',      team: 'Продуктовая разработка', planStatus: 'pending'  },
  { id: 4,  name: 'Анна Петрова',     avatar: '/avatars/sofia.webp',      team: 'Продуктовая разработка', planStatus: 'pending'  },
  { id: 6,  name: 'Сергей Николаев',  avatar: '/avatars/konstantin.webp', team: 'Продуктовая разработка', planStatus: 'draft'    },
  { id: 7,  name: 'Елена Козлова',    avatar: '/avatars/marina.webp',     team: 'Продуктовая разработка', planStatus: 'approved' },
  { id: 5,  name: 'Игорь Смирнов',   avatar: '/avatars/manokhin.webp',   team: 'Дизайн',                  planStatus: 'approved' },
  { id: 8,  name: 'Ольга Васильева',  avatar: '/avatars/olga.webp',       team: 'Дизайн',                  planStatus: 'draft'    },
  { id: 9,  name: 'Павел Морозов',    avatar: '/avatars/gavrilov.webp',   team: 'HR',                      planStatus: 'approved' },
  { id: 10, name: 'Ирина Лебедева',   avatar: '/avatars/irina.webp',      team: 'HR',                      planStatus: 'pending'  },
]
