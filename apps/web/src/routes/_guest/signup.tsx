import { createFileRoute } from "@tanstack/react-router";

import { SignupForm } from "#/auth/pages/signup-form";

export const Route = createFileRoute("/_guest/signup")({
  component: function SignupPage() {
    const { redirectUrl } = Route.useRouteContext();
    return <SignupForm redirectUrl={redirectUrl} />;
  },
});
