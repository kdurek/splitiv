import { UserBalance } from '@/components/group/user-balance';
import { Section } from '@/components/layout/section';
import { trpcServer } from '@/server/api/caller';

export default async function ExpensesAllPage() {
  const group = await trpcServer.group.getCurrent();

  return (
    <Section title="Wszystkie wydatki">
      <div className="flex flex-col gap-4">
        <UserBalance group={group} />
      </div>
    </Section>
  );
}
