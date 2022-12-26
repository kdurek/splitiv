import { Box, FormControl, FormLabel, Select, Stack } from "@chakra-ui/react";
import { SubmitHandler, useForm } from "react-hook-form";

import FormModal from "components/FormModal";
import { useAddUserToGroup } from "hooks/useAddUserToGroup";
import { GetUsers } from "utils/trpc";

interface AddUserToGroupFormValues {
  name: string;
  user: string;
}

interface AddUserToGroupModalProps {
  groupId: string | undefined;
  members: GetUsers;
  users: GetUsers;
}

function AddUserToGroupModal({
  groupId,
  members,
  users,
}: AddUserToGroupModalProps) {
  const { mutate: addUserToGroup } = useAddUserToGroup();
  const methods = useForm<AddUserToGroupFormValues>({
    defaultValues: { name: "Płatność" },
  });
  const { register } = methods;

  const onSubmit: SubmitHandler<AddUserToGroupFormValues> = (values) => {
    if (!groupId) {
      throw new Error("groupId not defined");
    }

    return addUserToGroup({ userId: values.user, groupId });
  };

  const groupUsers = members.map((user) => user.id);
  const usersNotInGroup = users.filter((user) => !groupUsers.includes(user.id));

  return (
    <FormModal<AddUserToGroupFormValues>
      modalButtonText="Dodaj użytkownika"
      headerText="Dodawanie użytkownika"
      cancelButtonText="Anuluj"
      submitButtonText="Dodaj"
      methods={methods}
      onSubmit={onSubmit}
    >
      <FormControl>
        <Stack>
          <Box>
            <FormLabel htmlFor="user">Użytkownik</FormLabel>
            <Select
              {...register("user", {
                required: "Pole jest wymagane",
              })}
              placeholder="Wybierz użytkownika"
            >
              {usersNotInGroup?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </Box>
        </Stack>
      </FormControl>
    </FormModal>
  );
}

export default AddUserToGroupModal;
