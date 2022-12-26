import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useForm } from "react-hook-form";

import FormModal from "components/FormModal";
import { useCreateGroup } from "hooks/useCreateGroup";

interface CreateGroupFormValues {
  name: string;
}

function CreateGroupModal() {
  const methods = useForm<CreateGroupFormValues>();
  const { mutate: createGroup } = useCreateGroup();

  const onSubmit = (values: CreateGroupFormValues) => {
    const { name } = values;
    createGroup({ name });
  };

  return (
    <FormModal<CreateGroupFormValues>
      modalButtonText="Stwórz grupę"
      headerText="Dodawanie grupy"
      cancelButtonText="Anuluj"
      submitButtonText="Stwórz"
      methods={methods}
      onSubmit={onSubmit}
    >
      <FormControl>
        <FormLabel htmlFor="name">Nazwa</FormLabel>
        <Input
          {...methods.register("name", {
            required: "Pole jest wymagane",
            minLength: { value: 3, message: "Minimum length should be 3" },
          })}
          id="name"
        />
      </FormControl>
    </FormModal>
  );
}

export default CreateGroupModal;
