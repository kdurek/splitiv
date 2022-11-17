import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef } from "react";

function ConfirmDialog({
  children,
  title,
  onClick = () => null,
  colorScheme,
  variant,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const handleSubmit = () => {
    onClick();
    onClose();
  };

  return (
    <>
      <Button variant={variant} colorScheme={colorScheme} onClick={onOpen}>
        {children}
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        size={["full", "2xl"]}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {title}
            </AlertDialogHeader>

            <AlertDialogBody>
              Jesteś pewny/a? Nie możesz cofnąć tej operacji.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Anuluj
              </Button>
              <Button colorScheme={colorScheme} onClick={handleSubmit} ml={4}>
                Potwierdź
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export default ConfirmDialog;
