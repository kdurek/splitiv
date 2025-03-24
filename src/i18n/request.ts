import { getRequestConfig } from 'next-intl/server';
import type { Messages } from 'next-intl';

import { getUserLocale } from '@/lib/locale';
import { type Locale } from '@/i18n/config';

export default getRequestConfig(async () => {
  const locale = (await getUserLocale()) as Locale;
  const messages = (await import(`../../messages/${locale}.json`)) as {
    default: Messages;
  };

  return {
    locale,
    messages: messages.default,
  };
});
