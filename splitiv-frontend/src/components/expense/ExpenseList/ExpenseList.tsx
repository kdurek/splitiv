import { Accordion } from "@chakra-ui/react";

import { Expense, User } from "../../../types";

import ExpenseCard from "./ExpenseCard";
import PaymentCard from "./PaymentCard";

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
