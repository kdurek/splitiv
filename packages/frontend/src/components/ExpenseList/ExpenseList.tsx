import { Accordion } from "@mantine/core";

import { useExpenses } from "hooks/useExpenses";
import { useGroup } from "hooks/useGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";

import ExpenseCard from "./ExpenseCard";

function ExpenseList() {
  const { activeGroupId: groupId } = useActiveGroup();
  const { data: group } = useGroup(groupId);
  const { data: expenses } = useExpenses(groupId);

  if (!group || !expenses) return null;

  return (
    <Accordion variant="contained">
      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} group={group} expense={expense} />
      ))}
    </Accordion>
  );
}

export default ExpenseList;
