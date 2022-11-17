import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getUsers() {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
  return res.data;
}

function useUsers() {
  return useQuery(["users"], getUsers);
}

export { useUsers };
