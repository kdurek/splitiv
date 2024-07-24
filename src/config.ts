export type Locale = (typeof locales)[number];

export const localesMap = [
  { label: 'English', value: 'en' },
  { label: 'Polish', value: 'pl' },
] as const;

export const locales = ['en', 'pl'] as const;

export const defaultLocale: Locale = 'pl';
