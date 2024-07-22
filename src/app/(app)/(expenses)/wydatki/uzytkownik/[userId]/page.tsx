import { ExpenseDetails } from '@/components/expense/expense-details';
import { Section } from '@/components/layout/section';
import { validateRequest } from '@/server/auth';
import { api } from '@/trpc/server';

interface ExpenseDetailsPageProps {
  params: {
    userId: string;
  };
}

export default async function ExpenseDetailsPage({ params }: ExpenseDetailsPageProps) {
  const { user } = await validateRequest();

  void api.user.byId.prefetch({ userId: params.userId });
  void api.expense.between.prefetch({
    payerId: params.userId,
    debtorId: user?.id,
  });
  void api.expense.between.prefetch({
    payerId: user?.id,
    debtorId: params.userId,
  });
  void api.user.current.prefetch();

  return (
    <Section title="Szczegóły">
      <ExpenseDetails paramsUserId={params.userId} />
    </Section>
  );
}
