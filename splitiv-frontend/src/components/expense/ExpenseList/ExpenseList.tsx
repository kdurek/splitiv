import { Accordion } from "@chakra-ui/react";

import ExpenseCard from "components/expense/ExpenseList/ExpenseCard";
import PaymentCard from "components/expense/ExpenseList/PaymentCard";
import { Expense, User } from "types";

interface ExpenseListProps {
  groupId: string | undefined;
  expenses: Expense[];
  members: User[];
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
