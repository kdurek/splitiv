import { Auth0Provider } from "@auth0/auth0-react";
import { ChakraProvider } from "@chakra-ui/react";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useRoutes } from "react-router-dom";

import { AuthProvider } from "providers/AuthProvider";
import { QueryProvider } from "providers/QueryProvider";

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import routes from "~react-pages";

function App() {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      redirectUri={import.meta.env.VITE_AUTH0_REDIRECT_URI}
      audience={import.meta.env.VITE_AUTH0_AUDIENCE}
      scope={import.meta.env.VITE_AUTH0_SCOPE}
      useRefreshTokens
      cacheLocation="localstorage"
    >
      <ChakraProvider>
        <AuthProvider>
          <QueryProvider>{useRoutes(routes)}</QueryProvider>
        </AuthProvider>
      </ChakraProvider>
    </Auth0Provider>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense>
        <App />
      </Suspense>
    </BrowserRouter>
  </StrictMode>
);