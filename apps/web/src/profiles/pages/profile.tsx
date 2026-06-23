import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@repo/ui/components/empty";
import { cn } from "@repo/ui/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MailIcon } from "lucide-react";

import { UserAvatar } from "#/components/user-avatar";
import { profileQueryOptions } from "#/profiles/queries";

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

function SectionRow({
  href,
  label,
  sublabel,
  amount,
  amountVariant = "neutral",
}: {
  href: string;
  label: string;
  sublabel?: string;
  amount: string;
  amountVariant?: "neutral" | "positive" | "negative";
}) {
  return (
    <Link
      to={href}
      className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/60"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
      <span
        className={cn(
          "shrink-0 text-sm font-bold",
          amountVariant === "positive" && "text-primary",
          amountVariant === "negative" && "text-destructive",
        )}
      >
        {amount}
      </span>
    </Link>
  );
}

interface ProfilePageProps {
  userId: string;
}

export function ProfilePage({ userId }: ProfilePageProps) {
  const { data } = useSuspenseQuery(profileQueryOptions(userId));
  const { user, balance, debts, expenses, payments } = data;

  const net = balance ? Number(balance.net) : 0;
  const isPositive = net > 0;

  return (
    <div className="space-y-8 px-4 pt-4 pb-8">
      {/* Identity header */}
      <section className="flex items-center gap-4 pt-2">
        <UserAvatar name={user.name} image={user.image} size="lg" shape="square" />
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight">{user.name}</h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MailIcon className="size-3.5 shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>
      </section>

      {/* Balance with viewer */}
      {balance && (
        <section className="space-y-3">
          <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            Bilans między wami
          </span>
          <div className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-3xl font-extrabold tracking-tight",
                  isPositive ? "text-primary" : net < 0 ? "text-destructive" : "",
                )}
              >
                {isPositive ? "+" : ""}
                {formatAmount(balance.net)}
              </span>
            </div>
            {(Number(balance.owedToYou) > 0 || Number(balance.youOwe) > 0) && (
              <div className="space-y-1.5 border-t border-border/60 pt-3">
                {Number(balance.owedToYou) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Należności</span>
                    <span className="font-semibold text-primary">
                      +{formatAmount(balance.owedToYou)}
                    </span>
                  </div>
                )}
                {Number(balance.youOwe) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Zobowiązania</span>
                    <span className="font-semibold text-destructive">
                      -{formatAmount(balance.youOwe)}
                    </span>
                  </div>
                )}
              </div>
            )}
            {net !== 0 && (
              <Link
                to="/settle/$userId"
                params={{ userId }}
                className="mt-1 block w-full rounded-lg bg-primary/10 py-2 text-center text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                Rozlicz dług
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Outstanding debts */}
      <section className="space-y-3">
        <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Oczekujące długi
        </span>
        {debts.length === 0 ? (
          <Empty className="rounded-xl bg-muted/40 py-6">
            <EmptyHeader>
              <EmptyTitle className="text-sm">Brak długów</EmptyTitle>
              <EmptyDescription className="text-xs">Nie ma oczekujących długów.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-2">
            {debts.map((debt) => (
              <SectionRow
                key={debt.debtId}
                href={`/expenses/${debt.expenseId}`}
                label={debt.expenseName}
                sublabel={formatDate(debt.expenseCreatedAt)}
                amount={formatAmount((Number(debt.amount) - Number(debt.settled)).toFixed(2))}
                amountVariant="negative"
              />
            ))}
          </div>
        )}
      </section>

      {/* Latest expenses as payer */}
      <section className="space-y-3">
        <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Ostatnie wydatki
        </span>
        {expenses.length === 0 ? (
          <Empty className="rounded-xl bg-muted/40 py-6">
            <EmptyHeader>
              <EmptyTitle className="text-sm">Brak wydatków</EmptyTitle>
              <EmptyDescription className="text-xs">
                Ta osoba nie opłaciła żadnych wydatków.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-2">
            {expenses.map((exp) => (
              <SectionRow
                key={exp.id}
                href={`/expenses/${exp.id}`}
                label={exp.name}
                sublabel={formatDate(exp.createdAt)}
                amount={formatAmount(exp.amount)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Latest payments */}
      <section className="space-y-3">
        <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Ostatnie spłaty
        </span>
        {payments.length === 0 ? (
          <Empty className="rounded-xl bg-muted/40 py-6">
            <EmptyHeader>
              <EmptyTitle className="text-sm">Brak spłat</EmptyTitle>
              <EmptyDescription className="text-xs">
                Ta osoba nie dokonała żadnych spłat.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-2">
            {payments.map((payment) => (
              <SectionRow
                key={payment.id}
                href={`/expenses/${payment.expenseId}`}
                label={payment.expenseName}
                sublabel={formatDate(payment.createdAt)}
                amount={formatAmount(payment.amount)}
                amountVariant="positive"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
