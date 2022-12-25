import {
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  NumberInput,
  NumberInputField,
  Select,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import { PLN } from "@dinero.js/currencies";
import { allocate, toDecimal } from "dinero.js";
import { SubmitHandler, useForm } from "react-hook-form";

import MethodTabs from "components/expense/CreateExpenseModal/MethodTabs";
import FormModal from "components/FormModal";
import { useCreateExpense } from "hooks/useCreateExpense";
import { dineroFromString } from "utils/dinero";
import { GetGroupById } from "utils/trpc";

interface CreateExpenseFormValues {
  name: string;
  amount: string;
  payer: string;
  method: string;
  equal: {
    id: string;
    check: boolean;
    paid: string;
    owed: string;
    userId: string;
  }[];
  unequal: {
    id: string;
    paid: string;
    owed: string;
    userId: string;
  }[];
  ratio: {
    id: string;
    paid: string;
    ratio: number;
    userId: string;
  }[];
}

interface CreateExpenseModalProps {
  group: GetGroupById;
}

function CreateExpenseModal({ group }: CreateExpenseModalProps) {
  const equalDefaults = group?.members.map((member) => ({
    id: member.id,
    name: member.name,
    check: false,
  }));

  const unequalDefaults = group?.members.map((member) => ({
    id: member.id,
    name: member.name,
    owed: "",
  }));

  const ratioDefaults = group?.members.map((member) => ({
    id: member.id,
    name: member.name,
    ratio: 0,
  }));

  const methods = useForm<CreateExpenseFormValues>({
    defaultValues: {
      amount: "",
      method: "equal",
      equal: equalDefaults,
      unequal: unequalDefaults,
      ratio: ratioDefaults,
    },
  });

  const { register } = methods;
  const { mutate: createExpense } = useCreateExpense();

  const onSubmit: SubmitHandler<CreateExpenseFormValues> = (values) => {
    if (!group?.id) {
      throw new Error("groupId not defined");
    }

    const { name, amount, payer, method, equal, unequal, ratio } = values;

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

        return createExpense({ groupId: group.id, name, amount, users });
      }

      case "unequal": {
        const users = unequal
          .filter((user) => parseFloat(user.owed) > 0 || payer === user.id)
          .map((user) => {
            const isPayer = payer === user.id;

            return {
              paid: isPayer ? amount : "0.00",
              owed: user.owed || "0.00",
              userId: user.id,
            };
          });

        return createExpense({ groupId: group.id, name, amount, users });
      }

      case "ratio": {
        const filteredUsers = ratio.filter(
          (user) => user.ratio > 0 || payer === user.id
        );
        const dineroAmount = dineroFromString({
          amount,
          currency: PLN,
          scale: 2,
        });
        const userRatios = filteredUsers.map((user) => user.ratio);
        const allocated = allocate(dineroAmount, userRatios);
        const users = filteredUsers.map((user, index) => {
          const isPayer = payer === user.id;

          return {
            paid: isPayer ? amount : "0.00",
            owed: toDecimal(allocated[index]) || "0.00",
            userId: user.id,
          };
        });

        return createExpense({ groupId: group.id, name, amount, users });
      }

      default: {
        return null;
      }
    }
  };

  return (
    <FormModal<CreateExpenseFormValues>
      modalButtonText="Dodaj wydatek"
      headerText="Dodawanie wydatku"
      cancelButtonText="Anuluj"
      submitButtonText="Dodaj"
      methods={methods}
      onSubmit={onSubmit}
    >
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
                      setValueAs: (v: string) =>
                        v ? parseFloat(v).toFixed(2) : "",
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
                })}
              >
                {group?.members.map((user) => (
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
    </FormModal>
  );
}

export default CreateExpenseModal;
