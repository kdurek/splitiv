import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getGroup(groupId) {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/groups/${groupId}`
  );
  return res.data;
}

function useGroup(groupId) {
  return useQuery(["groups", groupId], () => getGroup(groupId));
}

export { useGroup };
