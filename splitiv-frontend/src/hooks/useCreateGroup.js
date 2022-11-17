import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

async function createGroup(newGroup) {
  const res = await axios.post(
    `${import.meta.env.VITE_API_URL}/groups`,
    newGroup
  );
  return res.data;
}

function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation((values) => createGroup(values), {
    onSuccess: () => {
      return queryClient.invalidateQueries(["groups"]);
    },
  });
}

export { useCreateGroup };
