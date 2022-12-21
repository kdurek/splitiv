import { Accordion } from "@chakra-ui/react";

import ExpenseCard from "components/expense/ExpenseList/ExpenseCard";
import PaymentCard from "components/expense/ExpenseList/PaymentCard";
import { GetExpensesByGroup, GetUsers } from "utils/trpc";

interface ExpenseListProps {
  groupId: string | undefined;
  expenses: GetExpensesByGroup;
  members: GetUsers;
}

function ExpenseList({ groupId, expenses, members }: ExpenseListProps) {
  if (!groupId || !expenses || !members) return null;

  return (
    <Accordion allowToggle>
      {expenses.map((expense) => {
        if (expense.type === "expense")
          return <ExpenseCard key={expense.id} expense={expense} />;
        if (expense.type === "payment")
          return (
            <PaymentCard key={expense.id} expense={expense} members={members} />
          );
        return null;
      })}
    </Accordion>
  );
}

export default ExpenseList;
