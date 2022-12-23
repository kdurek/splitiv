import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import slugify from "slugify";

interface FormModalProps<TFormValues extends FieldValues> {
  children: ReactNode;
  methods: UseFormReturn<TFormValues>;
  headerText: string;
  modalButtonText: string;
  cancelButtonText: string;
  submitButtonText: string;
  onSubmit: (T: TFormValues) => void;
  onCancel?: () => void;
}

function FormModal<TFormValues extends FieldValues>({
  children,
  methods,
  headerText,
  modalButtonText,
  cancelButtonText,
  submitButtonText,
  onSubmit,
  onCancel = () => {},
}: FormModalProps<TFormValues>) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const formId = slugify(headerText, { lower: true });

  const handleSubmit: SubmitHandler<TFormValues> = (values) => {
    onSubmit(values);
    methods.reset();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  return (
    <>
      <Button onClick={onOpen}>{modalButtonText}</Button>

      <Modal isOpen={isOpen} onClose={onClose} size={["full", "2xl"]}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{headerText}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={methods.handleSubmit(handleSubmit)} id={formId}>
              <FormProvider {...methods}>{children}</FormProvider>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleCancel}>{cancelButtonText}</Button>
            <Button
              type="submit"
              form={formId}
              isLoading={methods.formState.isSubmitting}
              colorScheme="blue"
              ml={4}
            >
              {submitButtonText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default FormModal;
