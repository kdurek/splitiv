import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export function SignOutButton() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return (
    <Button
      className="w-full"
      onClick={async () => {
        await authClient.signOut({
          fetchOptions: {
            onResponse: async () => {
              // manually set to null to avoid unnecessary refetching
              queryClient.setQueryData(
                orpc.auth.getCurrentUser.queryOptions().queryKey,
                null
              );
              await router.invalidate();
            },
          },
        });
      }}
      size="lg"
      type="button"
      variant="destructive"
    >
      Wyloguj
    </Button>
  );
}
