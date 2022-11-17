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
import React from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { useAddUserToGroup } from "../../hooks/useAddUserToGroup";

function AddUserToGroupForm({ groupId, usersToAdd, onClose }) {
  const { mutate: addUserToGroup } = useAddUserToGroup(groupId);
  const { register, reset, handleSubmit } = useFormContext();

  const onSubmit = (values) => {
    const { user } = values;
    const requestData = { userId: Number(user) };

    onClose();
    reset();
    return addUserToGroup(requestData);
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

function AddUserToGroupModal({ groupId, members, users }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const methods = useForm({
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
              Stwórz
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default AddUserToGroupModal;
