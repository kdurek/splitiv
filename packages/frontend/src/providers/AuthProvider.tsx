import { useAuth0 } from "@auth0/auth0-react";
import { Button, Center } from "@chakra-ui/react";
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

  if (isLoading) return null;

  if (isAuthenticated && auth.token)
    return (
      <authContext.Provider value={auth}>
        <Layout>{children}</Layout>
      </authContext.Provider>
    );

  return (
    <Center h="100vh">
      <Button onClick={handleLogin}>Zaloguj</Button>
    </Center>
  );
}

export const useAuth = () => {
  return useContext(authContext);
};
