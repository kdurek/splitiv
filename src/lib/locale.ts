'use server';

import { cookies as cookiesPromise } from 'next/headers';
import { type Locale, defaultLocale } from '@/i18n/config';

const COOKIE_NAME = 'NEXT_LOCALE';

export async function getUserLocale() {
  const cookies = await cookiesPromise();
  return cookies.get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  const cookies = await cookiesPromise();
  cookies.set(COOKIE_NAME, locale);
}
