import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Expense } from "../types";

async function getGroupExpenses(groupId: string | undefined) {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/groups/${groupId}/expenses`
  );
  return res.data;
}

function useGroupExpenses(groupId: string | undefined) {
  return useQuery<Expense[]>(["groups", groupId, "expenses"], () =>
    getGroupExpenses(groupId)
  );
}

export { useGroupExpenses };
