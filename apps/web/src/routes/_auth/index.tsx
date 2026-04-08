import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { dashboardBalanceQueryOptions } from "~/server/dashboard/queries";

export const Route = createFileRoute("/_auth/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardBalanceQueryOptions()),
  component: AppIndex,
});

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatAmount(amount: string) {
  return `${Number(amount).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
}

function PersonRow({
  name,
  amount,
  variant,
}: {
  name: string;
  amount: string;
  variant: "owed" | "owe";
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          {getInitials(name)}
        </div>
        <span className="text-sm font-medium">{name}</span>
      </div>
      <span
        className={`text-sm font-bold ${variant === "owed" ? "text-primary" : "text-destructive"}`}
      >
        {formatAmount(amount)}
      </span>
    </div>
  );
}

function AppIndex() {
  const {
    data: { owedToYou, youOwe, totalOwedToYou, totalYouOwe, netBalance },
  } = useSuspenseQuery(dashboardBalanceQueryOptions());

  const net = Number(netBalance);
  const isPositive = net >= 0;

  return (
    <div className="flex flex-col gap-8 p-4">
      {/* Net balance */}
      <section className="flex flex-col gap-1 pt-4">
        <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Całkowity bilans netto
        </span>
        <div className="flex items-baseline gap-2">
          <h2
            className={`text-4xl leading-none font-extrabold tracking-tight ${isPositive ? "text-primary" : "text-destructive"}`}
          >
            {isPositive ? "+" : ""}
            {formatAmount(netBalance)}
          </h2>
        </div>
      </section>

      {/* Owed / Owe cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Należności — owed to you */}
        <div className="rounded-xl border-l-4 border-primary/40 bg-card p-5">
          <span className="mb-4 block text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            Należności
          </span>
          <div className="mb-5 text-2xl font-bold">{formatAmount(totalOwedToYou)}</div>
          {owedToYou.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nikt Ci nie jest winien pieniędzy.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {owedToYou.map((person) => (
                <PersonRow
                  key={person.userId}
                  name={person.name}
                  amount={person.amount}
                  variant="owed"
                />
              ))}
            </div>
          )}
        </div>

        {/* Zobowiązania — you owe */}
        <div className="rounded-xl border-l-4 border-destructive/40 bg-card p-5">
          <span className="mb-4 block text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            Zobowiązania
          </span>
          <div className="mb-5 text-2xl font-bold">{formatAmount(totalYouOwe)}</div>
          {youOwe.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nie jesteś nikomu winien pieniędzy.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {youOwe.map((person) => (
                <PersonRow
                  key={person.userId}
                  name={person.name}
                  amount={person.amount}
                  variant="owe"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
