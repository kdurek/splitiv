import { Accordion } from "@mantine/core";

import { useExpenses } from "hooks/useExpenses";
import { useActiveGroup } from "providers/ActiveGroupProvider";

import ExpenseCard from "./ExpenseCard";
import PaymentCard from "./PaymentCard";

function ExpenseList() {
  const { activeGroupId: groupId } = useActiveGroup();
  const { data: expenses } = useExpenses(groupId);

  if (!expenses) return null;

  return (
    <Accordion variant="separated">
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
