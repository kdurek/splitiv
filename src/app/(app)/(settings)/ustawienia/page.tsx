import { AddUserToGroupForm } from 'components/forms/add-user-to-group-form';
import { GroupSelect } from 'components/group-select';
import { LogoutButton } from 'components/logout-button';
import { Section } from 'components/section';
import { Separator } from 'components/ui/separator';
import { redirect } from 'next/navigation';
import { createTrpcCaller } from 'server/api/caller';
import { getServerAuthSession } from 'server/auth';

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const caller = await createTrpcCaller();
  const usersNotInCurrentGroup = await caller.user.getAllNotInCurrentGroup();
  const groups = await caller.group.getAll();
  const group = await caller.group.getCurrent();

  return (
    <Section title="Ustawienia">
      <div className="flex flex-col gap-6">
        <LogoutButton />
        <Separator />
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Aktywna grupa</h2>
          <GroupSelect activeGroupId={session.activeGroupId} groups={groups} />
        </div>
        {session.user.id === group.adminId && (
          <>
            <Separator />
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Członkowie</h2>
              <ol className="space-y-1">
                {group.members.map((user) => (
                  <li key={user.id} className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-black" /> {user.name}
                  </li>
                ))}
              </ol>
            </div>
            {!!usersNotInCurrentGroup.length && <AddUserToGroupForm users={usersNotInCurrentGroup} />}
          </>
        )}
      </div>
    </Section>
  );
}
