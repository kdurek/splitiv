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
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect } from "react";
import {
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form";

import { useCreateGroupExpense } from "../../hooks/useCreateGroupExpense";
import { Debt, User } from "../../types";

interface CreatePaymentFormProps {
  groupId: string | undefined;
  members: User[];
  debts: Debt[];
  onClose: () => void;
}

interface CreatePaymentFormValues {
  name: string;
  amount: string;
  payer: number;
  ower: number;
}

function CreatePaymentForm({
  groupId,
  members,
  debts,
  onClose,
}: CreatePaymentFormProps) {
  const { mutate: createGroupExpense } = useCreateGroupExpense(groupId);

  const { register, reset, getValues, setValue, handleSubmit } =
    useFormContext<CreatePaymentFormValues>();

  useEffect(() => {
    const firstDebtFound = debts?.[0];
    if (firstDebtFound) {
      setValue("ower", firstDebtFound.from);
      setValue("payer", firstDebtFound.to);
      setValue("amount", firstDebtFound.amount);
    }
  }, [debts, setValue]);

  const onSubmit: SubmitHandler<CreatePaymentFormValues> = (values) => {
    const { name, amount, payer, ower } = values;
    const type = "payment";
    const users = [
      {
        paid: amount,
        owed: "0.00",
        userId: ower,
      },
      {
        paid: "0.00",
        owed: amount,
        userId: payer,
      },
    ];

    const requestData = { name, amount, type, users };

    onClose();
    reset();
    return createGroupExpense(requestData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="create-payment">
      <FormControl>
        <Stack>
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
            <FormLabel htmlFor="ower">Od</FormLabel>
            <Select
              {...register("ower", {
                required: "Pole jest wymagane",
                validate: (v) => getValues("payer") !== v,
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
          <Box>
            <FormLabel htmlFor="payer">Dla</FormLabel>
            <Select
              {...register("payer", {
                required: "Pole jest wymagane",
                setValueAs: (v) => parseFloat(v),
                validate: (v) => getValues("ower") !== v,
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
      </FormControl>
    </form>
  );
}

interface CreatePaymentModalProps {
  groupId: string | undefined;
  members: User[];
  debts: Debt[];
}

function CreatePaymentModal({
  groupId,
  members,
  debts,
}: CreatePaymentModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const methods = useForm<CreatePaymentFormValues>({
    defaultValues: { name: "Płatność" },
  });

  if (!groupId || !members || !debts) return null;

  return (
    <>
      <Button onClick={onOpen}>Dodaj płatność</Button>

      <Modal isOpen={isOpen} onClose={onClose} size={["full", "2xl"]}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Stwórz płatność</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormProvider {...methods}>
              <CreatePaymentForm
                groupId={groupId}
                members={members}
                debts={debts}
                onClose={onClose}
              />
            </FormProvider>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Anuluj</Button>
            <Button
              type="submit"
              form="create-payment"
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

export default CreatePaymentModal;
