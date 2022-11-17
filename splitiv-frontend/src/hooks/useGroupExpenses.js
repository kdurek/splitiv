import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getGroupExpenses(groupId) {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/groups/${groupId}/expenses`
  );
  return res.data;
}

function useGroupExpenses(groupId) {
  return useQuery(["groups", groupId, "expenses"], () =>
    getGroupExpenses(groupId)
  );
}

export { useGroupExpenses };
