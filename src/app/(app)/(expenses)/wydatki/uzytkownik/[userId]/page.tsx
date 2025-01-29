import { getTranslations } from 'next-intl/server';

import { ExpensesWith } from '@/app/(app)/(expenses)/wydatki/uzytkownik/[userId]/with';
import { Section, SectionContent, SectionDescription, SectionHeader, SectionTitle } from '@/components/layout/section';
import { api, HydrateClient } from '@/trpc/server';

interface ExpensesWithUserPageProps {
  params: {
    userId: string;
  };
}

export default async function ExpensesWithUserPage({ params }: ExpensesWithUserPageProps) {
  const t = await getTranslations('ExpensesWithUserPage');

  const paramsUser = await api.user.byId({ id: params.userId });
  void api.expense.getExpensesBetweenUser.prefetch({
    userId: params.userId,
  });
  void api.user.current.prefetch();

  return (
    <HydrateClient>
      <Section>
        <SectionHeader>
          <SectionTitle>{t('title')}</SectionTitle>
          <SectionDescription>{paramsUser.name}</SectionDescription>
        </SectionHeader>
        <SectionContent>
          <ExpensesWith userId={params.userId} />
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
