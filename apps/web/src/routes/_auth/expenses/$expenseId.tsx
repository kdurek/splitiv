import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { Button } from "@repo/ui/components/button";
import {
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerPopup,
  DrawerPortal,
  DrawerRoot,
  DrawerViewport,
} from "@repo/ui/components/drawer";
import { Label } from "@repo/ui/components/label";
import { NumberField, NumberFieldInput } from "@repo/ui/components/number-field";
import { useForm, useStore } from "@tanstack/react-form";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2Icon, RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import * as React from "react";

import { UserAvatar } from "~/components/user-avatar";
import { $deleteExpense, $settleDebt, $undoDebtLog } from "~/server/expenses/mutations";
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

type Debt = {
  id: string;
  amount: string;
  settled: string;
  debtorId: string;
  debtorName: string;
  debtorImage: string | null;
};

function SettleDebtForm({ debt, onSuccess }: { debt: Debt; onSuccess: () => void }) {
  const remaining = Number(debt.amount) - Number(debt.settled);

  const form = useForm({
    defaultValues: { amount: remaining },
    onSubmit: async ({ value }) => {
      await $settleDebt({
        data: { debtId: debt.id, amount: value.amount.toFixed(2) },
      });
      onSuccess();
    },
  });

  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  return (
    <DrawerContent className="mx-auto w-full max-w-lg">
      <p className="mb-4 text-lg font-semibold tracking-tight">Rozlicz dług — {debt.debtorName}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="amount">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Kwota do rozliczenia</Label>
              <div className="relative">
                <NumberField
                  aria-label="Kwota do rozliczenia"
                  value={field.state.value}
                  onChange={(v) => field.handleChange(isNaN(v) ? 0 : v)}
                  onBlur={field.handleBlur}
                  minValue={0.01}
                  maxValue={remaining}
                  formatOptions={{
                    style: "decimal",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }}
                >
                  <NumberFieldInput id={field.name} className="pr-10" />
                </NumberField>
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                  zł
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Pozostało do spłaty: {formatAmount(remaining.toFixed(2))}
              </p>
            </div>
          )}
        </form.Field>

        <div className="flex flex-col gap-2 pt-2">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              "Rozlicz"
            )}
          </Button>
          <DrawerClose
            render={
              <Button type="button" variant="outline" className="w-full">
                Anuluj
              </Button>
            }
          />
        </div>
      </form>
    </DrawerContent>
  );
}

function SettleDebtDrawer({ debt, expenseId }: { debt: Debt; expenseId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [formKey, setFormKey] = React.useState(0);

  const handleOpen = () => {
    setFormKey((k) => k + 1);
    setOpen(true);
  };

  const handleSuccess = () => {
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["expense", expenseId] });
  };

  return (
    <DrawerRoot open={open} onOpenChange={setOpen}>
      <button type="button" onClick={handleOpen} className="w-full cursor-pointer text-left">
        <DebtCard debt={debt} />
      </button>

      <DrawerPortal>
        <DrawerBackdrop />
        <DrawerViewport>
          <DrawerPopup>
            <SettleDebtForm key={formKey} debt={debt} onSuccess={handleSuccess} />
          </DrawerPopup>
        </DrawerViewport>
      </DrawerPortal>
    </DrawerRoot>
  );
}

type Log = {
  id: string;
  amount: string;
  createdAt: string | Date;
  debtorName: string;
  debtId: string;
};

function UndoLogDrawer({
  log,
  expenseId,
  children,
}: {
  log: Log;
  expenseId: string;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleUndo = async () => {
    setIsSubmitting(true);
    try {
      await $undoDebtLog({ data: { logId: log.id } });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["expense", expenseId] });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DrawerRoot open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full cursor-pointer text-left"
      >
        {children}
      </button>

      <DrawerPortal>
        <DrawerBackdrop />
        <DrawerViewport>
          <DrawerPopup>
            <DrawerContent className="mx-auto w-full max-w-lg">
              <p className="mb-4 text-lg font-semibold tracking-tight">Cofnij wpłatę</p>
              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
                  <p>
                    Ta akcja jest nieodwracalna. Wpłata zostanie usunięta z historii, a dług
                    zostanie przywrócony.
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3 text-sm">
                  <p className="text-muted-foreground">Dłużnik</p>
                  <p className="font-semibold">{log.debtorName}</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3 text-sm">
                  <p className="text-muted-foreground">Kwota</p>
                  <p className="font-semibold">{formatAmount(log.amount)}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleUndo}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="size-4 animate-spin" />
                      Cofanie...
                    </>
                  ) : (
                    "Cofnij wpłatę"
                  )}
                </Button>
                <DrawerClose
                  render={
                    <Button type="button" variant="outline" className="w-full">
                      Anuluj
                    </Button>
                  }
                />
              </div>
            </DrawerContent>
          </DrawerPopup>
        </DrawerViewport>
      </DrawerPortal>
    </DrawerRoot>
  );
}

function DebtCard({ debt }: { debt: Debt }) {
  const amount = Number(debt.amount);
  const settled = Number(debt.settled);
  const percent = amount > 0 ? Math.round((settled / amount) * 100) : 0;
  const isFullySettled = settled >= amount;
  const isPartial = settled > 0 && settled < amount;

  return (
    <div className="space-y-4 rounded-xl bg-muted/40 p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar name={debt.debtorName} image={debt.debtorImage} size="lg" shape="square" />
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
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{formatAmount(debt.amount)}</p>
          <p
            className={`text-[10px] font-bold tracking-widest uppercase ${
              isFullySettled ? "text-primary" : "text-destructive"
            }`}
          >
            {isFullySettled ? "Zapłacone" : isPartial ? "W części zapłacone" : "Nieopłacone"}
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
}

function DeleteExpenseDrawer({
  expenseId,
  expenseName,
  expenseAmount,
  hasLogs,
}: {
  expenseId: string;
  expenseName: string;
  expenseAmount: string;
  hasLogs: boolean;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await $deleteExpense({ data: { expenseId } });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      navigate({ to: "/expenses" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DrawerRoot open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full cursor-pointer rounded-xl border border-destructive/40 bg-destructive/5 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
      >
        Usuń wydatek
      </button>

      <DrawerPortal>
        <DrawerBackdrop />
        <DrawerViewport>
          <DrawerPopup>
            <DrawerContent className="mx-auto w-full max-w-lg">
              <p className="mb-4 text-lg font-semibold tracking-tight">Usuń wydatek</p>
              {hasLogs ? (
                <>
                  <div className="mb-6 space-y-3">
                    <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
                      <p>
                        Nie można usunąć wydatku, który ma zarejestrowane wpłaty. Najpierw cofnij
                        wszystkie wpłaty.
                      </p>
                    </div>
                  </div>
                  <DrawerClose
                    render={
                      <Button type="button" variant="outline" className="w-full">
                        Zamknij
                      </Button>
                    }
                  />
                </>
              ) : (
                <>
                  <div className="mb-6 space-y-3">
                    <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
                      <p>
                        Ta akcja jest nieodwracalna. Wydatek i wszystkie powiązane długi zostaną
                        usunięte.
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3 text-sm">
                      <p className="text-muted-foreground">Wydatek</p>
                      <p className="font-semibold">{expenseName}</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3 text-sm">
                      <p className="text-muted-foreground">Kwota</p>
                      <p className="font-semibold">{formatAmount(expenseAmount)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2Icon className="size-4 animate-spin" />
                          Usuwanie...
                        </>
                      ) : (
                        "Usuń wydatek"
                      )}
                    </Button>
                    <DrawerClose
                      render={
                        <Button type="button" variant="outline" className="w-full">
                          Anuluj
                        </Button>
                      }
                    />
                  </div>
                </>
              )}
            </DrawerContent>
          </DrawerPopup>
        </DrawerViewport>
      </DrawerPortal>
    </DrawerRoot>
  );
}

function ExpenseDetail() {
  const { expenseId } = Route.useParams();
  const {
    data: { expense, debts, logs },
  } = useSuspenseQuery(expenseQueryOptions(expenseId));
  const { data: currentUser } = useSuspenseQuery(authQueryOptions());

  const currentUserId = currentUser?.id;
  const debtorIds = new Set(debts.map((d) => d.debtorId));
  const canManage =
    currentUserId === expense.payerId ||
    currentUserId === expense.groupAdminId ||
    (currentUserId != null && debtorIds.has(currentUserId));
  const debtById = new Map(debts.map((debt) => [debt.id, debt] as const));
  const settledAfterLogById = new Map(
    debts.map((debt) => [debt.id, Number(debt.settled)] as const),
  );

  // Most recent log per debt (logs are already ordered newest-first)
  const mostRecentLogIdByDebtId = new Map<string, string>();
  for (const log of logs) {
    if (!mostRecentLogIdByDebtId.has(log.debtId)) {
      mostRecentLogIdByDebtId.set(log.debtId, log.id);
    }
  }

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
              Zapłacił(a)
            </span>
            <div className="flex items-center gap-1.5">
              <UserAvatar
                name={expense.payerName}
                image={expense.payerImage}
                size="sm"
                shape="square"
              />
              <span className="font-semibold">{expense.payerName}</span>
            </div>
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
            const isFullySettled = Number(debt.settled) >= Number(debt.amount);
            const canSettleDebt =
              currentUserId === expense.payerId ||
              currentUserId === expense.groupAdminId ||
              currentUserId === debt.debtorId;

            if (isFullySettled || !canSettleDebt) {
              return (
                <div key={debt.id} className="cursor-default">
                  <DebtCard debt={debt} />
                </div>
              );
            }

            return <SettleDebtDrawer key={debt.id} debt={debt} expenseId={expenseId} />;
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
              const isUndoable = mostRecentLogIdByDebtId.get(log.debtId) === log.id;
              const canUndoLog =
                currentUserId === expense.payerId ||
                currentUserId === expense.groupAdminId ||
                currentUserId === debt?.debtorId;

              settledAfterLogById.set(log.debtId, settledBeforeLog);

              const logContent = (
                <>
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.createdAt)}
                        </span>
                        {isUndoable && canUndoLog && (
                          <RotateCcwIcon className="size-3.5 shrink-0 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <p
                      className={`font-mono text-sm font-medium ${isFullPayment ? "text-primary" : "text-foreground"}`}
                    >
                      +{formatAmount(log.amount)}
                    </p>
                  </div>
                </>
              );

              return (
                <div key={log.id} className="relative pl-12">
                  {isUndoable && canUndoLog ? (
                    <UndoLogDrawer log={log} expenseId={expenseId}>
                      {logContent}
                    </UndoLogDrawer>
                  ) : (
                    logContent
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Delete Expense */}
      {canManage && (
        <DeleteExpenseDrawer
          expenseId={expenseId}
          expenseName={expense.name}
          expenseAmount={expense.amount}
          hasLogs={logs.length > 0}
        />
      )}
    </div>
  );
}
