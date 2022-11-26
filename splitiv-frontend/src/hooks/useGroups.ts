import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Group } from "../types";

async function getGroups() {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups`);
  return res.data;
}

function useGroups() {
  return useQuery<Group[]>(["groups"], getGroups);
}

export { useGroups };
