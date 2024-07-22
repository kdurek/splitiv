import { Section } from '@/components/layout/section';
import { Settings } from '@/components/settings/settings';
import { api } from '@/trpc/server';

export default async function SettingsPage() {
  void api.user.current.prefetch();
  void api.group.list.prefetch();
  void api.user.current.prefetch();
  void api.group.current.prefetch();
  void api.user.listNotInCurrentGroup.prefetch();

  return (
    <Section title="Ustawienia">
      <Settings />
    </Section>
  );
}
