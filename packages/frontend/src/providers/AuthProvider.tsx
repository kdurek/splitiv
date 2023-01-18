import { useAuth0 } from "@auth0/auth0-react";
import { ReactNode, createContext, useContext } from "react";

import { useUser } from "hooks/useUser";
import { GetUser } from "utils/trpc";

const authContext = createContext<{
  user?: GetUser;
}>({ user: null });

const useProvideAuth = () => {
  const { user } = useAuth0();
  const { data: currentUser } = useUser(user?.sub);

  return { user: currentUser };
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useProvideAuth();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => {
  return useContext(authContext);
};
