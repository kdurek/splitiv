import { Container } from "@chakra-ui/react";
import { node } from "prop-types";

import Header from "./Header";

function Layout({ children }) {
  return (
    <>
      <Header />
      <Container maxW="xl" py={{ base: 4 }}>
        {children}
      </Container>
      {/* <Footer /> */}
    </>
  );
}

Layout.propTypes = {
  children: node.isRequired,
};

export default Layout;
