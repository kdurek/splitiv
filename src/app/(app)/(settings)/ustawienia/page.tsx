import { redirect } from 'next/navigation';

import { Section } from '@/components/layout/section';
import { Settings } from '@/components/settings/settings';
import { validateRequest } from '@/server/auth';

export default async function SettingsPage() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect('/logowanie');
  }

  return (
    <Section title="Ustawienia">
      <Settings user={user} />
    </Section>
  );
}
