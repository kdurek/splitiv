import { redirect } from "next/navigation";

import { AddUserToGroupForm } from "components/forms/add-user-to-group-form";
import { GroupSelect } from "components/group-select";
import { LogoutButton } from "components/logout-button";
import { Section } from "components/section";
import { createTrpcCaller } from "server/api/caller";
import { getServerAuthSession } from "server/auth";

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/logowanie");
  }

  const caller = await createTrpcCaller();
  const users = await caller.user.getAllNotInGroup();
  const groups = await caller.group.getAll();
  const group = await caller.group.getById();

  return (
    <Section title="Ustawienia">
      <div className="flex flex-col gap-4">
        <LogoutButton />
        <GroupSelect activeGroupId={session.activeGroupId} groups={groups} />
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-2xl">Członkowie</h2>
          <div className="flex flex-col">
            {group.members.map((user) => (
              <span key={user.id}>{user.name}</span>
            ))}
          </div>
          <AddUserToGroupForm users={users} />
        </div>
      </div>
    </Section>
  );
}
