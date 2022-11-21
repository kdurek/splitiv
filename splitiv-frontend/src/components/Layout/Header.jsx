import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Button,
  Collapse,
  Container,
  Flex,
  HStack,
  IconButton,
  Text,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { IconMenu2, IconMoon, IconSun, IconX } from "@tabler/icons";

import Logo from "./Logo";
import { DesktopNav, MobileNav } from "./Nav";

export default function Header() {
  const { logout } = useAuth0();
  const { isOpen, onToggle, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      bg={useColorModeValue("white", "gray.800")}
      color={useColorModeValue("gray.600", "white")}
      borderBottom={1}
      borderStyle="solid"
      borderColor={useColorModeValue("gray.200", "gray.900")}
    >
      <Container maxW="6xl" py={{ base: 2 }}>
        <HStack>
          <Flex
            flex={{ base: 1, md: "auto" }}
            ml={{ base: -2 }}
            display={{ base: "flex", md: "none" }}
          >
            <IconButton
              onClick={onToggle}
              icon={isOpen ? <IconX w={3} h={3} /> : <IconMenu2 w={5} h={5} />}
              variant="ghost"
              aria-label="Toggle Navigation"
            />
          </Flex>
          <Flex
            flex={{ base: 1 }}
            justify={{ base: "end", md: "start" }}
            align="center"
            spacing={2}
          >
            <Text
              ml={{ base: 0, md: -2 }}
              textAlign={useBreakpointValue({ base: "center", md: "left" })}
              fontFamily="heading"
              color={useColorModeValue("gray.800", "white")}
            >
              <Logo />
            </Text>

            <Flex display={{ base: "none", md: "flex" }} ml={6}>
              <DesktopNav />
            </Flex>
          </Flex>

          <IconButton
            onClick={toggleColorMode}
            variant="ghost"
            display={{ base: "none", md: "block" }}
            aria-label="Toggle Color Mode"
          >
            {colorMode === "light" ? <IconMoon /> : <IconSun />}
          </IconButton>
          <Button onClick={logout} display={{ base: "none", md: "block" }}>
            Wyloguj
          </Button>
        </HStack>
      </Container>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav onClose={onClose} />
      </Collapse>
    </Box>
  );
}
