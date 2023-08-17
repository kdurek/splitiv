import { redirect } from "next/navigation";

import { ExpensePaymentSettleForm } from "components/forms/expense-payment-settle-form";
import { Section } from "components/section";
import { createTrpcCaller } from "server/api/caller";
import { getServerAuthSession } from "server/auth";

interface ExpenseDetailsPageProps {
  params: {
    userId: string;
  };
}

export default async function ExpenseDetailsPage({
  params,
}: ExpenseDetailsPageProps) {
  const session = await getServerAuthSession();
  if (!session) {
    return redirect("/logowanie");
  }

  const caller = await createTrpcCaller();
  const paramUser = await caller.user.getById({ id: params.userId });
  const currentUser = await caller.user.getById({
    id: session.user.id,
  });

  if (!paramUser) {
    redirect("/");
  }

  const debts = await caller.user.getPaymentSettle({
    userId: params.userId,
  });

  return (
    <Section title={paramUser.name}>
      <ExpensePaymentSettleForm
        paramUser={paramUser}
        currentUser={currentUser}
        debts={debts}
      />
    </Section>
  );
}
