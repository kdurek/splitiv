import { createFileRoute } from "@tanstack/react-router";

import { LoginForm } from "~/auth/pages/login-form";

export const Route = createFileRoute("/_guest/login")({
  component: function LoginPage() {
    const { redirectUrl } = Route.useRouteContext();
    return <LoginForm redirectUrl={redirectUrl} />;
  },
});
