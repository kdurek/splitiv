import { Text, UnstyledButton } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

interface AddButtonProps {
  onClick: () => void;
}

function AddButton({ onClick }: AddButtonProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        width: "100%",
        paddingTop: theme.spacing.xs,
        paddingBottom: theme.spacing.xs,
      })}
    >
      <Text
        sx={{
          backgroundColor: "#373A40",
          flex: 1,
          height: 1,
          marginRight: 8,
        }}
      />
      <IconPlus />
      <Text
        sx={{
          backgroundColor: "#373A40",
          flex: 1,
          height: 1,
          marginLeft: 8,
        }}
      />
    </UnstyledButton>
  );
}

export default AddButton;
