import { Lock, User2 } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { LocaleSelect } from '@/app/(app)/(settings)/ustawienia/locale-select';
import { MembersList } from '@/app/(app)/(settings)/ustawienia/members-list';
import { Notification } from '@/app/(app)/(settings)/ustawienia/notification';
import { SignOutButton } from '@/app/(app)/(settings)/ustawienia/sign-out-button';
import { GroupSelect } from '@/components/group/group-select';
import { Section, SectionContent, SectionHeader, SectionTitle } from '@/components/layout/section';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils';
import { api, HydrateClient } from '@/trpc/server';

export default async function SettingsPage() {
  const t = await getTranslations('SettingsPage');

  void api.user.current.prefetch();
  void api.group.list.prefetch();
  void api.group.current.prefetch();
  void api.user.listNotInCurrentGroup.prefetch();

  const user = await api.user.current();
  const group = await api.group.current();

  return (
    <HydrateClient>
      <Section>
        <SectionHeader>
          <SectionTitle>{t('title')}</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <Link href={'/ustawienia/profil'} className={cn(buttonVariants({ variant: 'outline' }))}>
                <User2 className="mr-2" /> Profil
              </Link>
              <Link href={'/ustawienia/zmiana-hasla'} className={cn(buttonVariants({ variant: 'outline' }))}>
                <Lock className="mr-2" /> Zmiana hasła
              </Link>
              <SignOutButton />
            </div>

            <div className="space-y-2">
              <Heading variant="h2">Aktywna grupa</Heading>
              <GroupSelect />
            </div>

            <div className="space-y-2">
              <Heading variant="h2">Język</Heading>
              <LocaleSelect />
            </div>

            {user?.id === group.adminId && (
              <div className="space-y-2">
                <Heading variant="h2">Członkowie</Heading>
                <MembersList />
              </div>
            )}

            {user?.id === group.adminId && (
              <div className="space-y-2">
                <Heading variant="h2">Powiadomienia</Heading>
                <Notification />
              </div>
            )}
          </div>
        </SectionContent>
      </Section>
    </HydrateClient>
  );
}
