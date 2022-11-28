import { useAuth0 } from "@auth0/auth0-react";
import { Button, Center } from "@chakra-ui/react";
import axios from "axios";
import { ReactNode, useEffect } from "react";

import Layout from "components/Layout/Layout";

interface AxiosProviderProps {
  children: ReactNode;
}

function AxiosProvider({ children }: AxiosProviderProps) {
  const {
    getAccessTokenSilently,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
  } = useAuth0();

  const handleLogin = () => loginWithRedirect({ connection: "google-oauth2" });

  useEffect(() => {
    const setAxiosInterceptors = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        return axios.interceptors.request.use((config) => {
          return {
            ...config,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          };
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        return console.log(e);
      }
    };

    setAxiosInterceptors();
  }, [getAccessTokenSilently, isAuthenticated]);

  if (isLoading) return null;

  if (isAuthenticated) return <Layout>{children}</Layout>;

  return (
    <Center h="100vh">
      <Button onClick={handleLogin}>Zaloguj</Button>
    </Center>
  );
}

export { AxiosProvider };
