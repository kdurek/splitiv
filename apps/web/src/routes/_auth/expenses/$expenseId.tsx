import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { expenseQueryOptions } from "~/server/expenses/queries";

export const Route = createFileRoute("/_auth/expenses/$expenseId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(expenseQueryOptions(params.expenseId)),
  component: ExpenseDetail,
});

function formatAmount(amount: string) {
  return `${Number(amount).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ExpenseDetail() {
  const { expenseId } = Route.useParams();
  const {
    data: { expense, debts, logs },
  } = useSuspenseQuery(expenseQueryOptions(expenseId));
  const debtById = new Map(debts.map((debt) => [debt.id, debt] as const));
  const settledAfterLogById = new Map(
    debts.map((debt) => [debt.id, Number(debt.settled)] as const),
  );

  return (
    <div className="space-y-12 px-4 pt-4 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{expense.name}</h1>
        {expense.description && (
          <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
            {expense.description}
          </p>
        )}
      </div>

      {/* Hero Section: The Total */}
      <section className="space-y-4">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Łączna kwota
        </p>
        <p className="text-5xl font-extrabold tracking-tighter">{formatAmount(expense.amount)}</p>
        <div className="flex items-center gap-6 pt-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              Zapłacone przez
            </span>
            <span className="font-semibold">{expense.payerName}</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              Data
            </span>
            <span className="font-semibold">{formatDate(expense.createdAt)}</span>
          </div>
        </div>
      </section>

      {/* Bento Grid for Debt Records */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="font-semibold tracking-tight">Długi</h2>
          <span className="text-xs text-muted-foreground">{debts.length} uczestników</span>
        </div>
        <div className="space-y-3">
          {debts.map((debt) => {
            const amount = Number(debt.amount);
            const settled = Number(debt.settled);
            const percent = amount > 0 ? Math.round((settled / amount) * 100) : 0;
            const isFullySettled = settled >= amount;
            const isPartial = settled > 0 && settled < amount;

            return (
              <div key={debt.id} className="space-y-4 rounded-xl bg-muted/40 p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <p className="font-semibold">{debt.debtorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {isFullySettled
                        ? "W pełni rozliczone"
                        : isPartial
                          ? "Saldo oczekujące"
                          : "Brak wpłat"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatAmount(debt.amount)}</p>
                    <p
                      className={`text-[10px] font-bold tracking-widest uppercase ${
                        isFullySettled ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {isFullySettled
                        ? "Zapłacone"
                        : isPartial
                          ? "W części zapłacone"
                          : "Nieopłacone"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                    <span>Rozliczone: {formatAmount(debt.settled)}</span>
                    <span>{percent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Settlement Log Section */}
      {logs.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-semibold tracking-tight">Historia</h2>
          <div className="relative space-y-8 before:absolute before:top-2 before:bottom-2 before:left-4.75 before:w-px before:bg-border">
            {logs.map((log) => {
              const logAmount = Number(log.amount);
              const debt = debtById.get(log.debtId);
              const debtAmount = debt ? Number(debt.amount) : null;
              const settledAfterLog = settledAfterLogById.get(log.debtId) ?? 0;
              const settledBeforeLog = settledAfterLog - logAmount;
              const isFullPayment =
                debtAmount !== null &&
                settledAfterLog >= debtAmount &&
                settledBeforeLog < debtAmount;

              settledAfterLogById.set(log.debtId, settledBeforeLog);

              return (
                <div key={log.id} className="relative pl-12">
                  <div className="absolute top-1 left-0 flex size-10 items-center justify-center rounded-full bg-muted">
                    <span
                      className={`size-2 rounded-full ${isFullPayment ? "bg-primary" : "bg-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-semibold">
                        {log.debtorName}{" "}
                        {isFullPayment ? "rozliczył(a) cały dług" : "wpłacił(a) częściowo"}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`font-mono text-sm font-medium ${isFullPayment ? "text-primary" : "text-foreground"}`}
                    >
                      +{formatAmount(log.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
