import { Container } from "@chakra-ui/react";

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

export default Layout;
