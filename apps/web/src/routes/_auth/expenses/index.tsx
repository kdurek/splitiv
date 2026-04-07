import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/expenses/")({
  component: ExpensesIndex,
});

function ExpensesIndex() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Wydatki</h1>
    </div>
  );
}
