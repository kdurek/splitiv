import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Select,
  Stack,
  StackDivider,
  useDisclosure,
} from "@chakra-ui/react";
import React from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";

import { useCreateGroupExpense } from "../../../hooks/useCreateGroupExpense";

import MethodTabs from "./MethodTabs";

function CreateExpenseForm({ groupId, members, onClose }) {
  const { register, reset, handleSubmit } = useFormContext();
  const { mutate: createGroupExpense } = useCreateGroupExpense(groupId);

  const onSubmit = (values) => {
    const { name, amount, payer, method, equal, unequal } = values;

    switch (method) {
      case "equal": {
        const users = equal
          .filter((user) => user.check || payer === user.id)
          .map((user) => {
            const isPayer = payer === user.id;

            return {
              paid: isPayer ? amount : "0.00",
              owed: user.owed || "0.00",
              userId: user.id,
            };
          });

        const requestData = { name, amount, users };

        onClose();
        reset();
        return createGroupExpense(requestData);
      }

      case "unequal": {
        const users = unequal
          .filter((user) => user.owed > 0 || payer === user.id)
          .map((user) => {
            const isPayer = payer === user.id;

            return {
              paid: isPayer ? amount : "0.00",
              owed: user.owed || "0.00",
              userId: user.id,
            };
          });

        const requestData = { name, amount, users };

        onClose();
        reset();
        return createGroupExpense(requestData);
      }

      default: {
        onClose();
        reset();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="create-expense">
      <FormControl>
        <Stack
          divider={<StackDivider />}
          spacing={[4, 6]}
          direction={["column", "row"]}
        >
          <Stack minW={["full", "200px"]} spacing={[3, 5]}>
            <Box>
              <FormLabel htmlFor="name">Nazwa</FormLabel>
              <Input
                {...register("name", {
                  required: "Pole jest wymagane",
                  minLength: {
                    value: 3,
                    message: "Minimum length should be 3",
                  },
                })}
                placeholder="Wprowadź nazwę"
              />
            </Box>
            <Box>
              <FormLabel htmlFor="amount">Kwota</FormLabel>
              <InputGroup>
                <InputLeftAddon pointerEvents="none">zł</InputLeftAddon>
                <NumberInput precision={2} step={0.01} w="100%">
                  <NumberInputField
                    {...register("amount", {
                      required: "Pole jest wymagane",
                      setValueAs: (v) => (v ? parseFloat(v).toFixed(2) : ""),
                    })}
                    placeholder="0.00"
                    borderLeftRadius={0}
                  />
                </NumberInput>
              </InputGroup>
            </Box>
            <Box>
              <FormLabel htmlFor="payer">Zapłacone przez</FormLabel>
              <Select
                {...register("payer", {
                  required: "Pole jest wymagane",
                  setValueAs: (v) => parseFloat(v),
                })}
              >
                {members.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </Box>
          </Stack>
          <Box w="full">
            <MethodTabs />
          </Box>
        </Stack>
      </FormControl>
    </form>
  );
}

function CreateExpenseModal({ groupId, members }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const equalDefaults = members.map((member) => ({
    id: member.id,
    name: member.name,
    check: false,
  }));

  const unequalDefaults = members.map((member) => ({
    id: member.id,
    name: member.name,
    owed: "",
  }));

  const methods = useForm({
    defaultValues: {
      method: "equal",
      equal: equalDefaults,
      unequal: unequalDefaults,
    },
  });

  return (
    <>
      <Button onClick={onOpen}>Dodaj wydatek</Button>

      <Modal isOpen={isOpen} onClose={onClose} size={["full", "2xl"]}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Stwórz wydatek</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormProvider {...methods}>
              <CreateExpenseForm
                groupId={groupId}
                members={members}
                onClose={onClose}
              />
            </FormProvider>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Anuluj</Button>
            <Button
              type="submit"
              form="create-expense"
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

export default CreateExpenseModal;
