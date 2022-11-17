import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getGroups() {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/groups`);
  return res.data;
}

function useGroups() {
  return useQuery(["groups"], getGroups);
}

export { useGroups };
