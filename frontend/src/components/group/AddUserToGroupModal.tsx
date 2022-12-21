import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form";

import { useAddUserToGroup } from "hooks/useAddUserToGroup";
import { GetUsers } from "utils/trpc";

interface AddUserToGroupFormProps {
  groupId: string | undefined;
  usersToAdd: GetUsers;
  onClose: () => void;
}

interface AddUserToGroupFormValues {
  name: string;
  user: string;
}

function AddUserToGroupForm({
  groupId,
  usersToAdd,
  onClose,
}: AddUserToGroupFormProps) {
  const { mutate: addUserToGroup } = useAddUserToGroup();
  const { register, reset, handleSubmit } =
    useFormContext<AddUserToGroupFormValues>();

  const onSubmit: SubmitHandler<AddUserToGroupFormValues> = (values) => {
    if (!groupId) {
      throw new Error("groupId not defined");
    }

    onClose();
    reset();
    return addUserToGroup({ userId: values.user, groupId });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="add-user">
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
              {usersToAdd?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </Box>
        </Stack>
      </FormControl>
    </form>
  );
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const methods = useForm<AddUserToGroupFormValues>({
    defaultValues: { name: "Płatność" },
  });

  const groupUsers = members.map((user) => user.id);
  const usersNotInGroup = users.filter((user) => !groupUsers.includes(user.id));

  return (
    <>
      <Button onClick={onOpen}>Dodaj użytkownika</Button>

      <Modal isOpen={isOpen} onClose={onClose} size={["full", "2xl"]}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Dodaj użytkownika</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormProvider {...methods}>
              <AddUserToGroupForm
                groupId={groupId}
                usersToAdd={usersNotInGroup}
                onClose={onClose}
              />
            </FormProvider>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Anuluj</Button>
            <Button
              type="submit"
              form="add-user"
              isLoading={methods.formState.isSubmitting}
              colorScheme="blue"
              ml={4}
            >
              Dodaj
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default AddUserToGroupModal;
