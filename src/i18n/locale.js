export const LOCALE = (typeof window !== 'undefined' && window.location.pathname.startsWith('/en'))
  ? 'en'
  : 'ru'
