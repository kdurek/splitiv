import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form";

import { useCreateGroup } from "hooks/useCreateGroup";

interface CreateGroupFormProps {
  onClose: () => void;
}

interface CreateGroupFormValues {
  name: string;
  amount: string;
  payer: number;
  ower: number;
}

function CreateGroupForm({ onClose }: CreateGroupFormProps) {
  const { mutate: createGroup } = useCreateGroup();
  const { register, reset, handleSubmit } =
    useFormContext<CreateGroupFormValues>();

  const onSubmit: SubmitHandler<CreateGroupFormValues> = (values) => {
    const { name } = values;
    const requestData = { name };

    onClose();
    reset();
    return createGroup(requestData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="create-group">
      <FormControl>
        <FormLabel htmlFor="name">Nazwa</FormLabel>
        <Input
          {...register("name", {
            required: "Pole jest wymagane",
            minLength: { value: 3, message: "Minimum length should be 3" },
          })}
          id="name"
        />
      </FormControl>
    </form>
  );
}

function CreateGroupModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const methods = useForm<CreateGroupFormValues>();

  return (
    <>
      <Button onClick={onOpen}>Stwórz grupę</Button>

      <Modal isOpen={isOpen} onClose={onClose} size={["full", "2xl"]}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Stwórz grupę</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormProvider {...methods}>
              <CreateGroupForm onClose={onClose} />
            </FormProvider>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Anuluj</Button>
            <Button
              type="submit"
              form="create-group"
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

export default CreateGroupModal;
