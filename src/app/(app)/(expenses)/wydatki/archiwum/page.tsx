import { getTranslations } from 'next-intl/server';

import { Archive } from '@/components/expense/archive';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

export default async function ArchivePage() {
  const t = await getTranslations('ArchivePage');

  void api.expense.listArchive.prefetchInfinite({
    limit: 10,
  });
  void api.user.current.prefetch();

  return (
    <Section title={t('title')}>
      <Archive />
    </Section>
  );
}
