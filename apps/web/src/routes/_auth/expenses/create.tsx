import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/expenses/create")({
  component: CreateExpensePage,
});

function CreateExpensePage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Dodaj wydatek</h1>
    </div>
  );
}
