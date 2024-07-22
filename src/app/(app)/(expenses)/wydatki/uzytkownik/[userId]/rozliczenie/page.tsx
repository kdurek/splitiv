import { ExpenseSettlement } from '@/components/expense/expense-settlement';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

interface ExpenseSettlementPageProps {
  params: {
    userId: string;
  };
}

export default async function ExpenseSettlementPage({ params }: ExpenseSettlementPageProps) {
  void api.user.byId.prefetch({ userId: params.userId });
  void api.expense.debt.settlement.prefetch({
    userId: params.userId,
  });
  void api.user.current.prefetch();

  return (
    <Section title="Rozliczenie">
      <ExpenseSettlement paramsUserId={params.userId} />
    </Section>
  );
}
