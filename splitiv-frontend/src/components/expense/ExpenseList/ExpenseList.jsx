import { Stack } from "@chakra-ui/react";
import React from "react";

import ExpenseCard from "./ExpenseCard";
import PaymentCard from "./PaymentCard";

function ExpenseList({ groupId, expenses, members }) {
  if (!groupId || !expenses || !members) return null;

  return (
    <Stack spacing={4}>
      {expenses.map((expense) => {
        if (expense.type === "expense")
          return (
            <ExpenseCard key={expense.id} groupId={groupId} expense={expense} />
          );
        if (expense.type === "payment")
          return (
            <PaymentCard
              key={expense.id}
              groupId={groupId}
              expense={expense}
              members={members}
            />
          );
        return null;
      })}
    </Stack>
  );
}

export default ExpenseList;
