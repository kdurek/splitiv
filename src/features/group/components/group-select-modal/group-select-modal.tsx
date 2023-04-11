import { Button, Group, Modal, NativeSelect, Paper } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "react-hook-form";

import { useGroups } from "features/group/api/use-groups";

import { CreateGroupModal } from "../create-group-modal";

interface GroupSelectModalValues {
  group: string;
}

interface GroupSelectModalProps {
  defaultIsOpen: boolean;
  onSubmit: (values: GroupSelectModalValues) => void;
}

export function GroupSelectModal({
  defaultIsOpen,
  onSubmit,
}: GroupSelectModalProps) {
  const [opened, { close }] = useDisclosure(defaultIsOpen);
  const { data: groups } = useGroups();
  const {
    handleSubmit,
    register,
    reset,
    formState: { isSubmitting },
  } = useForm<GroupSelectModalValues>();

  const handleOnSubmit = (values: GroupSelectModalValues) => {
    onSubmit(values);
    reset();
    close();
  };

  if (!groups) return null;

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Wybierz aktywną grupę"
      closeOnEscape={false}
      withCloseButton={false}
      closeOnClickOutside={false}
    >
      <Paper
        component="form"
        id="group-select-modal"
        onSubmit={handleSubmit(handleOnSubmit)}
      >
        <NativeSelect
          {...register("group", {
            required: "Pole jest wymagane",
          })}
          mt={16}
          data={groups.map((group) => {
            return { value: group.id, label: group.name };
          })}
          label="Wybierz grupę"
          withAsterisk
        />
      </Paper>
      <Group mt={24} position="apart">
        <CreateGroupModal />
        <Button type="submit" form="group-select-modal" loading={isSubmitting}>
          Wybierz
        </Button>
      </Group>
    </Modal>
  );
}
