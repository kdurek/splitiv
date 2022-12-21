import { Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function Logo() {
  return (
    <Link
      as={RouterLink}
      to="/"
      fontSize="2xl"
      fontWeight={600}
      _hover={{
        textDecoration: "none",
      }}
    >
      Splitiv
    </Link>
  );
}
