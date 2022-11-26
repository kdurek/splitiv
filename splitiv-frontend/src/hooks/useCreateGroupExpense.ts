import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface NewExpenseValues {
  name: string;
  amount: string;
  type?: string;
  users: { paid: string; owed: string; userId: number }[];
}

function useCreateGroupExpense(groupId: string | undefined) {
  const queryClient = useQueryClient();

  async function createGroupExpense(newExpense: NewExpenseValues) {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/groups/${groupId}/expenses`,
      newExpense
    );
    return res.data;
  }

  return useMutation((values: NewExpenseValues) => createGroupExpense(values), {
    onSuccess: () => {
      return queryClient.invalidateQueries(["groups", groupId]);
    },
  });
}

export { useCreateGroupExpense };
