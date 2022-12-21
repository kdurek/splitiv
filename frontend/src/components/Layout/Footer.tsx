import { Box, Container, useColorModeValue } from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box
      color={useColorModeValue("gray.600", "gray.200")}
      borderTop={1}
      borderStyle="solid"
      borderColor={useColorModeValue("gray.200", "gray.900")}
    >
      {/* <Logo /> */}
      <Container maxW="6xl" py={4}>
        © 2022 Krzysztof Durek
      </Container>
    </Box>
  );
}
