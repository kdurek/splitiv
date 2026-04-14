import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { UserAvatar } from "~/components/user-avatar";
import { adminBalanceQueryOptions } from "~/server/admin/queries";

export const Route = createFileRoute("/_auth/admin")({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminBalanceQueryOptions()),
  component: AdminPage,
});

function formatAmount(amount: string) {
  return `${Number(amount).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
}

type DebtRow = {
  debtorId: string;
  debtorName: string;
  debtorImage: string | null;
  creditorId: string;
  creditorName: string;
  creditorImage: string | null;
  amount: string;
};

function AdminPage() {
  const { data: rows } = useSuspenseQuery(adminBalanceQueryOptions());

  // Group by creditor
  const byCreditor = rows.reduce<
    Record<string, { creditorName: string; creditorImage: string | null; debts: DebtRow[] }>
  >((acc, row) => {
    if (!acc[row.creditorId]) {
      acc[row.creditorId] = {
        creditorName: row.creditorName,
        creditorImage: row.creditorImage,
        debts: [],
      };
    }
    acc[row.creditorId].debts.push(row);
    return acc;
  }, {});

  const creditors = Object.entries(byCreditor);

  return (
    <div className="flex flex-col gap-8 p-4">
      <section className="pt-4">
        <h1 className="text-lg font-semibold tracking-tight">Panel admina</h1>
      </section>

      {creditors.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Wszystkie rozliczone.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {creditors.map(([creditorId, { creditorName, creditorImage, debts }]) => {
            const total = debts.reduce((sum, d) => sum + Number(d.amount), 0).toFixed(2);
            return (
              <div key={creditorId} className="rounded-xl border-l-4 border-primary/40 bg-card p-5">
                <div className="mb-4 flex items-center gap-3">
                  <UserAvatar name={creditorName} image={creditorImage} size="md" shape="square" />
                  <div>
                    <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                      Należności
                    </span>
                    <p className="text-sm font-semibold">{creditorName}</p>
                  </div>
                  <span className="ml-auto text-xl font-bold">{formatAmount(total)}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {debts.map((debt) => (
                    <div key={debt.debtorId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={debt.debtorName}
                          image={debt.debtorImage}
                          size="sm"
                          shape="square"
                        />
                        <span className="text-sm font-medium">{debt.debtorName}</span>
                      </div>
                      <span className="text-sm font-bold text-destructive">
                        {formatAmount(debt.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
