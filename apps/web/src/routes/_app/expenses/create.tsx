import { createFileRoute } from "@tanstack/react-router";
import { CreateExpenseForm } from "@/components/create-expense-form";

export const Route = createFileRoute("/_app/expenses/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CreateExpenseForm />;
}
