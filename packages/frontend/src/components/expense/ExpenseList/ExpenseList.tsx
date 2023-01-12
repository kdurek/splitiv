import { Accordion } from "@mantine/core";

import { useExpenses } from "hooks/useExpenses";
import { useGroup } from "hooks/useGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";

import ExpenseCard from "./ExpenseCard";
import PaymentCard from "./PaymentCard";

function ExpenseList() {
  const { activeGroupId: groupId } = useActiveGroup();
  const { data: group } = useGroup(groupId);
  const { data: expenses } = useExpenses(groupId);

  if (!group || !expenses) return null;

  return (
    <Accordion variant="contained">
      {expenses.map((expense) => {
        if (expense.type === "expense")
          return (
            <ExpenseCard key={expense.id} group={group} expense={expense} />
          );
        if (expense.type === "payment")
          return (
            <PaymentCard key={expense.id} group={group} expense={expense} />
          );
        return null;
      })}
    </Accordion>
  );
}

export default ExpenseList;
