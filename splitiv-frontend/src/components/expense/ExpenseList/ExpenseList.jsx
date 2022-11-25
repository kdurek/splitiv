import { Accordion } from "@chakra-ui/react";
import { arrayOf, string } from "prop-types";

import { expenseType, userType } from "../../../types";

import ExpenseCard from "./ExpenseCard";
import PaymentCard from "./PaymentCard";

function ExpenseList({ groupId, expenses, members }) {
  if (!groupId || !expenses || !members) return null;

  return (
    <Accordion allowToggle>
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
    </Accordion>
  );
}

ExpenseList.propTypes = {
  groupId: string.isRequired,
  expenses: arrayOf(expenseType),
  members: arrayOf(userType),
};

ExpenseList.defaultProps = {
  expenses: [],
  members: [],
};

export default ExpenseList;
