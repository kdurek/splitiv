import { Container } from "@chakra-ui/react";
import { ReactNode } from "react";

import Header from "components/Layout/Header";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
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
