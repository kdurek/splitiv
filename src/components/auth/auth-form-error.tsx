export function AuthFormError({ state }: { state: { error: string } }) {
  if (state.error)
    return (
      <div className="my-4 w-full rounded-md bg-destructive p-4 text-xs text-destructive-foreground">{state.error}</div>
    );
  return null;
}
