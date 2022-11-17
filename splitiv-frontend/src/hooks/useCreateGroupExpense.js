import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

function useCreateGroupExpense(groupId) {
  const queryClient = useQueryClient();

  async function createGroupExpense(newExpense) {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/groups/${groupId}/expenses`,
      newExpense
    );
    return res.data;
  }

  return useMutation((values) => createGroupExpense(values), {
    onSuccess: () => {
      return queryClient.invalidateQueries(["groups", groupId]);
    },
  });
}

export { useCreateGroupExpense };
