import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { NumberField, NumberFieldInput } from "@repo/ui/components/number-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import { useForm, useStore } from "@tanstack/react-form";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";

import { UserAvatar } from "~/components/user-avatar";
import { distributeByRatio } from "~/lib/distribute";
import { isExpenseSubmitDisabled } from "~/lib/expense-form";
import { $createExpense } from "~/server/expenses/mutations";
import { groupsQueryOptions } from "~/server/groups/queries";

export const Route = createFileRoute("/_auth/expenses/create")({
  loader: ({ context }) => context.queryClient.ensureQueryData(groupsQueryOptions()),
  component: CreateExpensePage,
});

function fmtAmount(n: number) {
  return n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";
}

function CreateExpensePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: { currentUser, currentGroupMembers },
  } = useSuspenseQuery(groupsQueryOptions());

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      payerId: currentUser.id,
      amount: 0 as number,
      method: "ratio" as "ratio" | "custom",
      debtors: currentGroupMembers.map((m) => ({
        userId: m.userId,
        ratio: 0 as number,
        custom: 0 as number,
      })),
    },
    onSubmit: async ({ value }) => {
      const debts =
        value.method === "ratio"
          ? distributeByRatio(value.amount, value.debtors)
          : value.debtors
              .filter((d) => d.custom > 0)
              .map((d) => ({ debtorId: d.userId, amount: d.custom.toFixed(2) }));

      const { expenseId } = await $createExpense({
        data: {
          title: value.title,
          description: value.description || undefined,
          payerId: value.payerId,
          amount: value.amount.toFixed(2),
          debts,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      navigate({ to: "/expenses/$expenseId", params: { expenseId } });
    },
  });

  const method = useStore(form.store, (s) => s.values.method);
  const amount = useStore(form.store, (s) => s.values.amount);
  const debtors = useStore(form.store, (s) => s.values.debtors);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);

  const isSubmitDisabled = useStore(
    form.store,
    (s) => s.isSubmitting || isExpenseSubmitDisabled(s.values),
  );

  const remaining =
    method === "custom"
      ? Math.round((amount - debtors.reduce((sum, d) => sum + d.custom, 0)) * 100) / 100
      : null;

  const computedRatioAmounts =
    method === "ratio"
      ? new Map(distributeByRatio(amount, debtors).map((d) => [d.debtorId, parseFloat(d.amount)]))
      : new Map<string, number>();

  return (
    <div className="space-y-8 p-4 pb-8">
      <h1 className="text-lg font-semibold tracking-tight">Dodaj wydatek</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <form.Field name="title">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Tytuł</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="np. Zakupy spożywcze"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>
                Opis{" "}
                <span className="text-xs font-normal text-muted-foreground">(opcjonalnie)</span>
              </Label>
              <Textarea
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Dodatkowe szczegóły..."
              />
            </div>
          )}
        </form.Field>

        <form.Field name="amount">
          {(field) => (
            <div className="space-y-2">
              <Label>Kwota</Label>
              <div className="relative">
                <NumberField
                  aria-label="Kwota"
                  value={field.state.value}
                  onChange={(v) => field.handleChange(isNaN(v) ? 0 : v)}
                  onBlur={field.handleBlur}
                  minValue={0}
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
            </div>
          )}
        </form.Field>

        <form.Field name="payerId">
          {(field) => (
            <div className="space-y-2">
              <Label>Zapłacił(a)</Label>
              <Select
                items={currentGroupMembers.map((m) => ({ value: m.userId, label: m.name }))}
                value={field.state.value}
                onValueChange={(v) => {
                  if (v) field.handleChange(v);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentGroupMembers.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      <UserAvatar name={m.name} image={m.image} size="sm" shape="square" />
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <form.Field name="method">
          {(field) => (
            <div className="space-y-2">
              <Label>Podział</Label>
              <Select
                items={[
                  { value: "ratio", label: "Według udziałów" },
                  { value: "custom", label: "Kwoty własne" },
                ]}
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as "ratio" | "custom")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ratio">Według udziałów</SelectItem>
                  <SelectItem value="custom">Kwoty własne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Uczestnicy</Label>
            {method === "custom" && remaining !== null && (
              <span
                className={`text-xs font-semibold tabular-nums ${remaining === 0 ? "text-primary" : "text-destructive"}`}
              >
                Pozostało: {fmtAmount(Math.abs(remaining))}
                {remaining < 0 ? " (nadpłata)" : ""}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {currentGroupMembers.map((member, index) => {
              const computedAmount = computedRatioAmounts.get(member.userId);
              return (
                <div
                  key={member.userId}
                  className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2"
                >
                  <UserAvatar name={member.name} image={member.image} size="sm" shape="square" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{member.name}</span>
                  {method === "ratio" && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {computedAmount !== undefined ? fmtAmount(computedAmount) : "—"}
                    </span>
                  )}
                  {method === "ratio" ? (
                    <form.Field name={`debtors[${index}].ratio`}>
                      {(field) => (
                        <NumberField
                          aria-label={`Udział ${member.name}`}
                          value={field.state.value}
                          onChange={(v) => field.handleChange(isNaN(v) ? 0 : Math.round(v))}
                          onBlur={field.handleBlur}
                          minValue={0}
                        >
                          <NumberFieldInput className="w-20 text-center" />
                        </NumberField>
                      )}
                    </form.Field>
                  ) : (
                    <form.Field name={`debtors[${index}].custom`}>
                      {(field) => (
                        <div className="relative">
                          <NumberField
                            aria-label={`Kwota ${member.name}`}
                            value={field.state.value}
                            onChange={(v) => field.handleChange(isNaN(v) ? 0 : v)}
                            onBlur={field.handleBlur}
                            minValue={0}
                            formatOptions={{
                              style: "decimal",
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }}
                          >
                            <NumberFieldInput className="w-28 pr-8" />
                          </NumberField>
                          <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                            zł
                          </span>
                        </div>
                      )}
                    </form.Field>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
          {isSubmitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            "Dodaj wydatek"
          )}
        </Button>
      </form>
    </div>
  );
}
