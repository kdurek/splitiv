import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

const $getExpenses = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const expenses = await db.query.expense.findMany({
      limit: 5,
      orderBy: (expense, { desc }) => [desc(expense.createdAt)],
      with: {
        payer: { columns: { name: true } },
      },
    });
    return expenses;
  });

export const Route = createFileRoute("/_auth/")({
  loader: () => $getExpenses(),
  component: AppIndex,
});

function AppIndex() {
  const expenses = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-4 p-2">
      <h2 className="text-lg font-semibold">Ostatnie wydatki</h2>
      {expenses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Brak wydatków.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {expenses.map((expense) => (
            <li key={expense.id} className="rounded-md border bg-card p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{expense.name}</span>
                  {expense.description && (
                    <span className="text-xs text-muted-foreground">{expense.description}</span>
                  )}
                  {expense.payer && (
                    <span className="text-xs text-muted-foreground">
                      Zapłacił(a) {expense.payer.name}
                    </span>
                  )}
                </div>
                <span className="shrink-0 font-mono font-semibold">
                  ${Number(expense.amount).toFixed(2)}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {new Date(expense.createdAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
