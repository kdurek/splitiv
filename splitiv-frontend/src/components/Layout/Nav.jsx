import { useAuth0 } from "@auth0/auth0-react";
import {
  Button,
  HStack,
  Link,
  Stack,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { IconLogout, IconMoon, IconSun } from "@tabler/icons";
import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";

const NAV_ITEMS = [
  {
    label: "Grupy",
    href: "/groups",
  },
];

function DesktopNavItem({ label, href }) {
  const linkColor = useColorModeValue("gray.600", "gray.200");
  const linkHoverColor = useColorModeValue("gray.800", "white");

  return (
    <Link
      as={RouterLink}
      to={href ?? "#"}
      p={2}
      fontSize="sm"
      fontWeight={500}
      color={linkColor}
      _hover={{
        textDecoration: "none",
        color: linkHoverColor,
      }}
    >
      {label}
    </Link>
  );
}

DesktopNavItem.propTypes = {
  label: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};

export function DesktopNav() {
  return (
    <HStack>
      {NAV_ITEMS.map((navItem) => (
        <DesktopNavItem key={navItem.label} {...navItem} />
      ))}
    </HStack>
  );
}

function MobileNavItem({ label, href, onClose }) {
  const linkColor = useColorModeValue("gray.600", "gray.200");

  return (
    <Link
      key={label}
      as={RouterLink}
      py={2}
      to={href ?? "#"}
      fontWeight={600}
      color={linkColor}
      _hover={{
        textDecoration: "none",
      }}
      onClick={onClose}
    >
      {label}
    </Link>
  );
}

export function MobileNav({ onClose }) {
  const { logout } = useAuth0();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Stack
      bg={useColorModeValue("white", "gray.800")}
      p={4}
      display={{ md: "none" }}
    >
      <Stack>
        {NAV_ITEMS.map((navItem) => (
          <MobileNavItem key={navItem.label} onClose={onClose} {...navItem} />
        ))}
        <HStack>
          <Button
            w="full"
            leftIcon={colorMode === "light" ? <IconMoon /> : <IconSun />}
            onClick={toggleColorMode}
          >
            {colorMode === "light" ? "Ciemny" : "Jasny"}
          </Button>
          <Button w="full" leftIcon={<IconLogout />} onClick={logout}>
            Wyloguj
          </Button>
        </HStack>
      </Stack>
    </Stack>
  );
}
