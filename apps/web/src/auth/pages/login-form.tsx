import { SiGoogle } from "@icons-pack/react-simple-icons";
import { authClient } from "@repo/auth/auth-client";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { GalleryVerticalEndIcon } from "lucide-react";
import { toast } from "sonner";

import { SignInSocialButton } from "../components/sign-in-social-button";

interface LoginFormProps {
  redirectUrl: string;
}

export function LoginForm({ redirectUrl }: LoginFormProps) {
  const { mutate: emailLoginMutate, isPending } = useMutation({
    mutationFn: async (data: { email: string; password: string }) =>
      await authClient.signIn.email(
        {
          ...data,
          callbackURL: redirectUrl,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message || "Wystąpił błąd podczas logowania.");
          },
          // better-auth seems to trigger a hard navigation on login,
          // so we don't have to revalidate & navigate ourselves
        },
      ),
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) return;

    emailLoginMutate({ email, password });
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <Link to="/" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex h-8 w-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
              <span className="sr-only">Splitiv</span>
            </Link>
            <h1 className="text-xl font-bold">Witaj z powrotem w Splitiv</h1>
          </div>
          <div className="grid gap-4">
            <SignInSocialButton
              provider="google"
              callbackURL={redirectUrl}
              disabled={isPending}
              icon={<SiGoogle className="size-4" />}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
