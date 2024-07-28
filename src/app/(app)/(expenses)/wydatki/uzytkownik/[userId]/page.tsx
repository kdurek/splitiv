import { getTranslations } from 'next-intl/server';

import { ExpenseDetails } from '@/components/expense/expense-details';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

interface ExpenseDetailsPageProps {
  params: {
    userId: string;
  };
}

export default async function ExpenseDetailsPage({ params }: ExpenseDetailsPageProps) {
  const t = await getTranslations('ExpenseDetailsPage');

  void api.user.byId.prefetch({ userId: params.userId });
  void api.expense.getExpensesBetweenUser.prefetch({
    userId: params.userId,
  });
  void api.user.current.prefetch();

  return (
    <Section title={t('title')}>
      <ExpenseDetails paramsUserId={params.userId} />
    </Section>
  );
}
