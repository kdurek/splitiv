import { Accordion } from "@chakra-ui/react";

import ExpenseCard from "components/expense/ExpenseList/ExpenseCard";
import PaymentCard from "components/expense/ExpenseList/PaymentCard";
import { GetExpensesByGroup } from "utils/trpc";

interface ExpenseListProps {
  expenses: GetExpensesByGroup;
}

function ExpenseList({ expenses }: ExpenseListProps) {
  if (!expenses) return null;

  return (
    <Accordion allowToggle>
      {expenses.map((expense) => {
        if (expense.type === "expense")
          return <ExpenseCard key={expense.id} expense={expense} />;
        if (expense.type === "payment")
          return <PaymentCard key={expense.id} expense={expense} />;
        return null;
      })}
    </Accordion>
  );
}

export default ExpenseList;
