import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Ustawienia</h1>
    </div>
  );
}
