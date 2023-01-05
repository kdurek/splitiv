import { Auth0Provider } from "@auth0/auth0-react";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useRoutes } from "react-router-dom";

import { CustomFonts } from "components/Layout/CustomFonts";
import { ActiveGroupProvider } from "providers/ActiveGroupProvider";
import { AuthProvider } from "providers/AuthProvider";
import { LayoutProvider } from "providers/LayoutProvider";
import { QueryProvider } from "providers/QueryProvider";

// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import routes from "~react-pages";

function App() {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

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
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          theme={{
            colorScheme,
            fontFamily: "Poppins, sans-serif",
            headings: { fontFamily: "Poppins, sans-serif" },
          }}
          withGlobalStyles
          withNormalizeCSS
        >
          <CustomFonts />
          <LayoutProvider>
            <AuthProvider>
              <QueryProvider>
                <ActiveGroupProvider>
                  <Suspense>{useRoutes(routes)}</Suspense>
                </ActiveGroupProvider>
              </QueryProvider>
            </AuthProvider>
          </LayoutProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </Auth0Provider>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
