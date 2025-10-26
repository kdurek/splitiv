import { Spinner } from "@/components/ui/spinner";

export function PageLoader() {
  return (
    <div className="mt-8 flex h-full items-center justify-center">
      <Spinner className="size-32 text-muted" />
    </div>
  );
}
