'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Locale } from '@/i18n/config';
import { setUserLocale } from '@/lib/locale';

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  function onChange(value: Locale) {
    startTransition(async () => {
      await setUserLocale(value);
    });
  }

  const items = [
    {
      value: 'en',
      label: t('en'),
    },
    {
      value: 'pl',
      label: t('pl'),
    },
  ];

  return (
    <Select defaultValue={locale} onValueChange={onChange}>
      <SelectTrigger disabled={isPending}>
        <SelectValue placeholder={t('label')} />
      </SelectTrigger>
      <SelectContent>
        {items.map((locale) => (
          <SelectItem key={locale.value} value={locale.value}>
            {locale.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
