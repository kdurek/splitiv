import { useAuth0 } from "@auth0/auth0-react";
import { Button, Center } from "@chakra-ui/react";
import axios from "axios";
import { ReactNode, createContext, useContext, useEffect } from "react";

import Layout from "../components/Layout/Layout";

const authContext = createContext(null);

const useProvideAuth = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    getAccessTokenSilently().then((accessToken) => {
      return axios.interceptors.request.use((config) => {
        return {
          ...config,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
      });
    });
  }, [getAccessTokenSilently, isAuthenticated]);

  return null;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useProvideAuth();
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const handleLogin = () => loginWithRedirect({ connection: "google-oauth2" });

  if (isLoading) return null;

  if (isAuthenticated)
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
