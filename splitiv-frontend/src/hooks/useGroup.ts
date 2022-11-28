import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Group } from "types";

async function getGroup(groupId: string | undefined) {
  const res = await axios.get(
    `${import.meta.env.VITE_API_URL}/groups/${groupId}`
  );
  return res.data;
}

function useGroup(groupId: string | undefined) {
  return useQuery<Group>(["groups", groupId], () => getGroup(groupId));
}

export { useGroup };
