import { Stack, Title } from "@mantine/core";

import CreateExpenseModal from "components/expense/CreateExpenseModal";
import CreateLoanModal from "components/expense/CreateLoanModal";
import CreatePaymentModal from "components/expense/CreatePaymentModal";
import ExpenseList from "components/expense/ExpenseList";
import UserBalance from "components/expense/UserBalance";
import GroupSelect from "components/GroupSelect/GroupSelect";
import { useActiveGroup } from "providers/ActiveGroupProvider";

function Expenses() {
  const { activeGroupId: groupId } = useActiveGroup();

  return (
    <Stack>
      <Title order={1}>Wydatki</Title>
      <GroupSelect />
      <UserBalance />
      <CreateExpenseModal groupId={groupId} />
      <CreateLoanModal groupId={groupId} />
      <CreatePaymentModal groupId={groupId} />
      <ExpenseList />
    </Stack>
  );
}

export default Expenses;
