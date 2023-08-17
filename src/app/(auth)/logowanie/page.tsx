import { redirect } from "next/navigation";

import { LoginButton } from "components/login-button";
import { getServerAuthSession } from "server/auth";

export default async function LoginPage() {
  const session = await getServerAuthSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="p-4">
      <div className="flex border rounded-md p-4 flex-col items-center gap-4">
        <h1 className="max-w-md">Aby przejść dalej, zaloguj się</h1>
        <LoginButton />
      </div>
    </div>
  );
}
