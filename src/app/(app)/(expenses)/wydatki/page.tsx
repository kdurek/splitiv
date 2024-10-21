import { getTranslations } from 'next-intl/server';

import { Archive } from '@/components/expense/archive';
import { Expenses } from '@/components/expense/expenses';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/layout/section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, HydrateClient } from '@/trpc/server';

export default async function ExpensesPage() {
  const t = await getTranslations('ExpensesPage');

  void api.expense.list.prefetchInfinite({
    limit: 10,
    type: 'active',
  });
  void api.expense.list.prefetchInfinite({
    limit: 10,
    type: 'archive',
  });
  void api.user.current.prefetch();

  return (
    <HydrateClient>
      <Section>
        <SectionHeader>
          <SectionTitle>{t('title')}</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Aktualne</TabsTrigger>
              <TabsTrigger value="archive">Archiwalne</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <Expenses />
            </TabsContent>
            <TabsContent value="archive">
              <Archive />
            </TabsContent>
          </Tabs>
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
