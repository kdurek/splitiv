'use client';

import { useLocale } from 'next-intl';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Locale, localesMap } from '@/config';
import { setUserLocale } from '@/server/locale';

export function LocaleSelect() {
  const currentLocale = useLocale();

  const handleLocaleSelect = async (value: Locale) => {
    await setUserLocale(value);
  };

  return (
    <Select defaultValue={currentLocale} onValueChange={handleLocaleSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Wybierz język" />
      </SelectTrigger>
      <SelectContent>
        {localesMap.map((locale) => (
          <SelectItem key={locale.value} value={locale.value}>
            {locale.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
