import { SiGoogle } from "@icons-pack/react-simple-icons";
import { authClient } from "@repo/auth/auth-client";
import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEndIcon } from "lucide-react";
import { toast } from "sonner";

import { SignInSocialButton } from "~/components/sign-in-social-button";

export const Route = createFileRoute("/_guest/signup")({
  component: SignupForm,
});

function SignupForm() {
  const { redirectUrl } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: signupMutate, isPending } = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      await authClient.signUp.email(
        {
          ...data,
          callbackURL: redirectUrl,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message || "Wystąpił błąd podczas rejestracji.");
          },
          onSuccess: () => {
            queryClient.removeQueries({ queryKey: authQueryOptions().queryKey });
            navigate({ to: redirectUrl });
          },
        },
      );
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (!name || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      toast.error("Hasła nie są identyczne.");
      return;
    }

    signupMutate({ name, email, password });
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
            <h1 className="text-xl font-bold">Zarejestruj się w Splitiv</h1>
          </div>
          {/* <div className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="name">Imię i nazwisko</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Jan Kowalski"
                readOnly={isPending}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Adres e-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="hello@example.com"
                readOnly={isPending}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Hasło"
                readOnly={isPending}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm_password">Powtórz hasło</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Powtórz hasło"
                readOnly={isPending}
                required
              />
            </div>
            <Button type="submit" className="mt-2 w-full" size="lg" disabled={isPending}>
              {isPending && <LoaderCircleIcon className="animate-spin" />}
              {isPending ? "Rejestrowanie..." : "Zarejestruj się"}
            </Button>
          </div>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">Lub</span>
          </div> */}
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

      {/* <div className="text-center text-sm">
        Masz już konto?{" "}
        <Link to="/login" className="underline underline-offset-4">
          Zaloguj się
        </Link>
      </div> */}
    </div>
  );
}
