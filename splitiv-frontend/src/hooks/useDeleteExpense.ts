import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

function useDeleteExpense({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient();

  async function deleteExpense(expenseId: number) {
    const res = await axios.delete(
      `${import.meta.env.VITE_API_URL}/groups/${groupId}/expenses/${expenseId}`
    );
    return res.data;
  }

  return useMutation(deleteExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries(["groups", groupId]);
      queryClient.invalidateQueries(["groups", groupId, "expenses"]);
    },
  });
}

export { useDeleteExpense };
