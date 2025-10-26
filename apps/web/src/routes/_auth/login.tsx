import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GalleryVerticalEndIcon } from "lucide-react";
import { toast } from "sonner";
import { SignInSocialButton } from "@/components/sign-in-social-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const { redirectUrl } = Route.useRouteContext();

  const { mutate: emailLoginMutate, isPending } = useMutation({
    mutationFn: async (data: { email: string; password: string }) =>
      await authClient.signIn.email(
        {
          ...data,
          callbackURL: redirectUrl,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message || "An error occurred while signing in.");
          },
        }
      ),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!(email && password)) {
      return;
    }

    emailLoginMutate({ email, password });
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              className="flex flex-col items-center gap-2 font-medium"
              href="/"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
              <span className="sr-only">Splitiv</span>
            </a>
            <h1 className="font-bold text-xl">Witaj w Splitiv</h1>
          </div>
          <div className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="email@example.com"
                readOnly={isPending}
                required
                type="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                name="password"
                placeholder="********"
                readOnly={isPending}
                required
                type="password"
              />
            </div>
            <Button
              className="mt-2 w-full"
              disabled={isPending}
              size="lg"
              type="submit"
            >
              {isPending && <Spinner />}
              {isPending ? "Logowanie..." : "Zaloguj"}
            </Button>
          </div>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Lub
            </span>
          </div>
          <div className="grid gap-4">
            <SignInSocialButton
              callbackURL={redirectUrl}
              disabled={isPending}
              icon={
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <title>Google</title>
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
              }
              provider="google"
            />
          </div>
        </div>
      </form>

      <div className="text-center text-sm">
        Nie masz jeszcze konta?{" "}
        <Link className="underline underline-offset-4" to="/signup">
          Zarejestruj się
        </Link>
      </div>
    </div>
  );
}
