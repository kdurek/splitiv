import { useAuth0 } from "@auth0/auth0-react";
import { Button, Center, Stack, Title } from "@mantine/core";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import Layout from "components/Layout/Layout";

const authContext = createContext<{ token?: string }>({});

const useProvideAuth = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [token, setToken] = useState<string>();

  useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently().then((accessToken) => {
        setToken(accessToken);
      });
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  return { token };
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useProvideAuth();
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const handleLogin = () => loginWithRedirect({ connection: "google-oauth2" });

  if (!isLoading && !isAuthenticated) {
    return (
      <Layout>
        <Center component={Stack} w="100%" h="100%">
          <Title maw={400} align="center">
            Musisz się zalogować aby przejść dalej
          </Title>
          <Button variant="default" onClick={handleLogin}>
            Zaloguj
          </Button>
        </Center>
      </Layout>
    );
  }

  if ((isLoading && !isAuthenticated) || !auth?.token) return null;

  return (
    <authContext.Provider value={auth}>
      <Layout>{children}</Layout>
    </authContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(authContext);
};
