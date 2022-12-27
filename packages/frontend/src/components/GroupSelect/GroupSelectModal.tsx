import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
} from "@chakra-ui/react";
import { SubmitHandler, useForm } from "react-hook-form";

import CreateGroupModal from "components/group/CreateGroupModal";
import { useGroups } from "hooks/useGroups";

interface GroupSelectModalValues {
  group: string;
}

interface GroupSelectModalProps {
  defaultIsOpen: boolean;
  onSubmit: (T: GroupSelectModalValues) => void;
}

function GroupSelectModal({ defaultIsOpen, onSubmit }: GroupSelectModalProps) {
  const { data: groups, isLoading: isLoadingGroups } = useGroups();
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen });
  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = useForm<GroupSelectModalValues>();

  const handleOnSubmit: SubmitHandler<GroupSelectModalValues> = (values) => {
    onSubmit(values);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      size={["full", "2xl"]}
    >
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Wybierz aktywną grupę</ModalHeader>
          <ModalBody>
            <Select
              {...register("group", {
                required: "Pole jest wymagane",
              })}
              disabled={isLoadingGroups}
            >
              {groups?.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter justifyContent="space-between">
            <CreateGroupModal />
            <Button type="submit" isLoading={isSubmitting} colorScheme="blue">
              Wybierz
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
  );
}

export default GroupSelectModal;
