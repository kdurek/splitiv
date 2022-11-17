import { Heading } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link to="/">
      <Heading>Splitiv</Heading>
    </Link>
  );
}
