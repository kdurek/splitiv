import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { User } from "../types";

async function getUsers() {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
  return res.data;
}

function useUsers() {
  return useQuery<User[]>(["users"], getUsers);
}

export { useUsers };
