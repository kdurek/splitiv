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
import { cn } from "@repo/ui/lib/utils";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  Loader2Icon,
  PencilIcon,
  ReceiptIcon,
} from "lucide-react";
import { useState } from "react";

import { UserAvatar } from "~/components/user-avatar";
import { dashboardBalanceQueryOptions } from "~/server/dashboard/queries";
import { $settleDebts } from "~/server/expenses/mutations";
import { debtsFromUserQueryOptions, debtsToUserQueryOptions } from "~/server/expenses/queries";

export const Route = createFileRoute("/_auth/settle/$userId")({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(dashboardBalanceQueryOptions()),
      context.queryClient.ensureQueryData(debtsToUserQueryOptions(params.userId)),
      context.queryClient.ensureQueryData(debtsFromUserQueryOptions(params.userId)),
    ]),
  component: SettlePage,
});

function formatAmount(amount: string) {
  return `${Number(amount).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("pl-PL", { day: "numeric", month: "long" });
}

type DebtItem = Awaited<
  ReturnType<typeof import("~/server/expenses/functions").$getDebtsToUser>
>[number];

function getRemaining(debt: DebtItem) {
  return (Number(debt.amount) - Number(debt.settled)).toFixed(2);
}

function EditAmountDrawer({
  open,
  debt,
  initialAmount,
  maxAmount,
  onSave,
  onClose,
}: {
  open: boolean;
  debt: DebtItem | null;
  initialAmount: number;
  maxAmount: number;
  onSave: (value: number) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialAmount);

  if (open && value !== initialAmount && debt) {
    setValue(initialAmount);
  }

  return (
    <DrawerRoot open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerPortal>
        <DrawerBackdrop />
        <DrawerViewport>
          <DrawerPopup>
            <DrawerContent className="mx-auto w-full max-w-lg">
              <p className="mb-4 text-lg font-semibold tracking-tight">
                Zmień kwotę - {debt?.expenseName}
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Kwota do rozliczenia</Label>
                  <div className="relative">
                    <NumberField
                      aria-label="Kwota do rozliczenia"
                      value={value}
                      onChange={(v) => setValue(isNaN(v) ? 0 : v)}
                      minValue={0.01}
                      maxValue={maxAmount}
                      formatOptions={{
                        style: "decimal",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }}
                    >
                      <NumberFieldInput className="pr-10" />
                    </NumberField>
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                      zł
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Maks. do spłaty: {formatAmount(maxAmount.toFixed(2))}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={() => onSave(value)}
                    disabled={value <= 0 || value > maxAmount}
                  >
                    Zastosuj
                  </Button>
                  <DrawerClose
                    render={
                      <Button type="button" variant="outline" className="w-full">
                        Anuluj
                      </Button>
                    }
                  />
                </div>
              </div>
            </DrawerContent>
          </DrawerPopup>
        </DrawerViewport>
      </DrawerPortal>
    </DrawerRoot>
  );
}

function DebtList({
  debts,
  selectedIds,
  customAmounts,
  onToggle,
  onEdit,
}: {
  debts: DebtItem[];
  selectedIds: Set<string>;
  customAmounts: Map<string, string>;
  onToggle: (debtId: string) => void;
  onEdit: (debt: DebtItem) => void;
}) {
  const effectiveAmount = (debt: DebtItem) => customAmounts.get(debt.debtId) ?? getRemaining(debt);

  return (
    <div className="rounded-xl border bg-card">
      {debts.map((debt, i) => {
        const isSelected = selectedIds.has(debt.debtId);
        const isCustom = customAmounts.has(debt.debtId);
        const displayAmount = effectiveAmount(debt);

        return (
          <div
            key={debt.debtId}
            className={cn(
              "flex items-center gap-3 px-4 py-3 transition-opacity",
              i < debts.length - 1 ? "border-b border-border/60" : "",
              !isSelected ? "opacity-40" : "",
            )}
          >
            <button type="button" onClick={() => onToggle(debt.debtId)} className="shrink-0">
              <div
                className={cn(
                  "relative flex size-10 items-center justify-center rounded-xl transition-colors",
                  isSelected ? "bg-primary/15" : "bg-muted",
                )}
              >
                <ReceiptIcon
                  className={cn(
                    "size-5 transition-colors",
                    isSelected ? "text-primary" : "text-muted-foreground",
                  )}
                />
                {isSelected && (
                  <div className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary">
                    <CheckIcon className="size-2.5 text-primary-foreground" />
                  </div>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => onToggle(debt.debtId)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-sm font-semibold">{debt.expenseName}</p>
              <p className="text-[10px] font-medium text-muted-foreground">
                {formatDate(debt.expenseCreatedAt)}
              </p>
            </button>

            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5">
                {isSelected && (
                  <button
                    type="button"
                    onClick={() => onEdit(debt)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <PencilIcon className="size-3" />
                  </button>
                )}
                <p className="text-sm font-bold">{formatAmount(displayAmount)}</p>
              </div>
              <p
                className={cn(
                  "text-[10px] font-bold tracking-widest uppercase",
                  isSelected ? "text-primary" : "text-muted-foreground",
                )}
              >
                {isSelected ? (isCustom ? "CZĘŚCIOWO" : "WYBRANO") : "ODZNACZONO"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SettlePage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: balance } = useSuspenseQuery(dashboardBalanceQueryOptions());
  const { data: debtsTo } = useSuspenseQuery(debtsToUserQueryOptions(userId));
  const { data: debtsFrom } = useSuspenseQuery(debtsFromUserQueryOptions(userId));

  const allDebts = [...debtsTo, ...debtsFrom];

  const [prevUserId, setPrevUserId] = useState(userId);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(allDebts.map((d) => d.debtId)),
  );
  const [customAmounts, setCustomAmounts] = useState<Map<string, string>>(new Map());
  const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasChanges = customAmounts.size > 0 || allDebts.some((d) => !selectedIds.has(d.debtId));

  if (prevUserId !== userId) {
    setPrevUserId(userId);
    setSelectedIds(new Set(allDebts.map((d) => d.debtId)));
    setCustomAmounts(new Map());
    setEditingDebt(null);
  }

  const effectiveAmount = (debt: DebtItem) => customAmounts.get(debt.debtId) ?? getRemaining(debt);

  const selectedToTotal = debtsTo
    .filter((d) => selectedIds.has(d.debtId))
    .reduce((sum, d) => sum + Number(effectiveAmount(d)), 0);

  const selectedFromTotal = debtsFrom
    .filter((d) => selectedIds.has(d.debtId))
    .reduce((sum, d) => sum + Number(effectiveAmount(d)), 0);

  const net = selectedFromTotal - selectedToTotal;

  const toggleDebt = (debtId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(debtId)) next.delete(debtId);
      else next.add(debtId);
      return next;
    });
  };

  const handleSaveAmount = (debt: DebtItem, value: number) => {
    setCustomAmounts((prev) => {
      const next = new Map(prev);
      if (value === Number(getRemaining(debt))) next.delete(debt.debtId);
      else next.set(debt.debtId, value.toFixed(2));
      return next;
    });
    setEditingDebt(null);
  };

  const handleSubmit = async () => {
    const selected = allDebts
      .filter((d) => selectedIds.has(d.debtId))
      .map((d) => ({ debtId: d.debtId, amount: effectiveAmount(d) }));

    if (selected.length === 0) return;

    setIsSubmitting(true);
    try {
      await $settleDebts({ data: { debts: selected } });
      queryClient.invalidateQueries({ queryKey: ["dashboard-balance"] });
      navigate({ to: "/" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Merged user list with net balance per person
  const allPeople = (() => {
    const youOweMap = new Map(balance.youOwe.map((p) => [p.userId, Number(p.amount)]));
    const owedToYouMap = new Map(balance.owedToYou.map((p) => [p.userId, Number(p.amount)]));
    const allUserIds = new Set([...youOweMap.keys(), ...owedToYouMap.keys()]);

    return Array.from(allUserIds).map((uid) => {
      const person =
        balance.youOwe.find((p) => p.userId === uid) ??
        balance.owedToYou.find((p) => p.userId === uid)!;
      const netAmount = (owedToYouMap.get(uid) ?? 0) - (youOweMap.get(uid) ?? 0);
      return { userId: uid, name: person.name, image: person.image, net: netAmount };
    });
  })();

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* User selector */}
      <div className="space-y-3 px-4 pt-4">
        <h1 className="text-lg font-semibold tracking-tight">Rozlicz dług</h1>
        {allPeople.length > 0 && (
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {allPeople.map((person) => {
              const isReceiving = person.net > 0;
              const netAbs = Math.abs(person.net).toFixed(2);
              return (
                <button
                  key={person.userId}
                  type="button"
                  onClick={() => {
                    if (person.userId === userId) return;
                    if (hasChanges) {
                      setPendingUserId(person.userId);
                    } else {
                      navigate({ to: "/settle/$userId", params: { userId: person.userId } });
                    }
                  }}
                  className={cn(
                    "flex shrink-0 flex-col items-center gap-2 rounded-2xl border p-3 transition-all",
                    person.userId === userId
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card",
                  )}
                >
                  <UserAvatar name={person.name} image={person.image} size="lg" shape="square" />
                  <div className="text-center">
                    <p className="text-xs font-semibold">{person.name.split(" ")[0]}</p>
                    <p
                      className={cn(
                        "flex items-center justify-center gap-0.5 text-[10px] font-bold",
                        isReceiving ? "text-primary" : "text-destructive",
                      )}
                    >
                      {isReceiving ? (
                        <ArrowUpIcon className="size-2.5" />
                      ) : (
                        <ArrowDownIcon className="size-2.5" />
                      )}
                      {formatAmount(netAbs)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Debt sections */}
      <div className="space-y-6 px-4">
        {debtsTo.length === 0 && debtsFrom.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Brak długów do rozliczenia.
          </p>
        ) : (
          <>
            {debtsFrom.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                  Należności
                </h2>
                <DebtList
                  debts={debtsFrom}
                  selectedIds={selectedIds}
                  customAmounts={customAmounts}
                  onToggle={toggleDebt}
                  onEdit={setEditingDebt}
                />
              </div>
            )}
            {debtsTo.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                  Zobowiązania
                </h2>
                <DebtList
                  debts={debtsTo}
                  selectedIds={selectedIds}
                  customAmounts={customAmounts}
                  onToggle={toggleDebt}
                  onEdit={setEditingDebt}
                />
              </div>
            )}

            {/* Net summary */}
            <div className="space-y-2 rounded-xl border bg-card px-4 py-4">
              {debtsTo.length > 0 && debtsFrom.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                      Otrzymujesz
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {formatAmount(selectedFromTotal.toFixed(2))}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                      Oddajesz
                    </p>
                    <p className="text-sm font-bold text-destructive">
                      {formatAmount(selectedToTotal.toFixed(2))}
                    </p>
                  </div>
                  <div className="border-t border-border/60 pt-2" />
                </>
              )}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                  Bilans
                </p>
                <p
                  className={cn(
                    "text-2xl font-extrabold tracking-tight",
                    net > 0 ? "text-primary" : net < 0 ? "text-destructive" : "",
                  )}
                >
                  {net > 0 ? "+" : ""}
                  {formatAmount(net.toFixed(2))}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Submit */}
      <div className="px-4">
        <Button
          className="w-full"
          disabled={selectedIds.size === 0 || isSubmitting}
          onClick={() => setConfirmOpen(true)}
        >
          {selectedIds.size > 0 ? "Rozlicz" : "Wybierz wydatki"}
        </Button>
      </div>

      {/* Edit amount drawer */}
      <EditAmountDrawer
        open={editingDebt !== null}
        debt={editingDebt}
        initialAmount={editingDebt ? Number(effectiveAmount(editingDebt)) : 0}
        maxAmount={editingDebt ? Number(getRemaining(editingDebt)) : 0}
        onSave={(value) => editingDebt && handleSaveAmount(editingDebt, value)}
        onClose={() => setEditingDebt(null)}
      />

      {/* Submit confirmation drawer */}
      <DrawerRoot open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DrawerPortal>
          <DrawerBackdrop />
          <DrawerViewport>
            <DrawerPopup>
              <DrawerContent className="mx-auto w-full max-w-lg">
                <p className="mb-4 text-lg font-semibold tracking-tight">Potwierdź rozliczenie</p>
                {(() => {
                  const otherPerson = allPeople.find((p) => p.userId === userId);
                  const otherName = otherPerson?.name.split(" ")[0] ?? "druga osoba";
                  const netAbs = Math.abs(net).toFixed(2);
                  return (
                    <div className="mb-6 space-y-1 text-sm text-muted-foreground">
                      {net < 0 && (
                        <p>
                          Ty płacisz{" "}
                          <span className="font-semibold text-destructive">
                            {formatAmount(netAbs)}
                          </span>{" "}
                          → <span className="font-semibold text-foreground">{otherName}</span>
                        </p>
                      )}
                      {net > 0 && (
                        <p>
                          <span className="font-semibold text-foreground">{otherName}</span> płaci{" "}
                          <span className="font-semibold text-primary">{formatAmount(netAbs)}</span>{" "}
                          → Ty
                        </p>
                      )}
                      {net === 0 && <p>Rozliczenie wyrównane — nikt nikomu nie płaci.</p>}
                    </div>
                  );
                })()}
                <div className="flex flex-col gap-2">
                  <Button className="w-full" disabled={isSubmitting} onClick={handleSubmit}>
                    {isSubmitting ? (
                      <>
                        <Loader2Icon className="size-4 animate-spin" />
                        Rozliczanie...
                      </>
                    ) : (
                      "Potwierdź"
                    )}
                  </Button>
                  <DrawerClose
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        disabled={isSubmitting}
                      >
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

      {/* Discard changes confirmation drawer */}
      <DrawerRoot
        open={pendingUserId !== null}
        onOpenChange={(open) => !open && setPendingUserId(null)}
      >
        <DrawerPortal>
          <DrawerBackdrop />
          <DrawerViewport>
            <DrawerPopup>
              <DrawerContent className="mx-auto w-full max-w-lg">
                <p className="mb-2 text-lg font-semibold tracking-tight">Niezapisane zmiany</p>
                <p className="mb-6 text-sm text-muted-foreground">
                  Masz niezapisane zmiany. Zmiana osoby spowoduje ich utratę.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={() => {
                      navigate({ to: "/settle/$userId", params: { userId: pendingUserId! } });
                      setPendingUserId(null);
                    }}
                  >
                    Zmień osobę
                  </Button>
                  <DrawerClose
                    render={
                      <Button type="button" variant="outline" className="w-full">
                        Zostań
                      </Button>
                    }
                  />
                </div>
              </DrawerContent>
            </DrawerPopup>
          </DrawerViewport>
        </DrawerPortal>
      </DrawerRoot>
    </div>
  );
}
