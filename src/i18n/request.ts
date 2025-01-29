import type { AbstractIntlMessages } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { getUserLocale } from '@/lib/locale';

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: ((await import(`../../messages/${locale}.json`)) as Record<string, AbstractIntlMessages>).default,
  };
});
