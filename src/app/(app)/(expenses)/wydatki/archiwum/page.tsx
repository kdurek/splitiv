import { Archive } from '@/components/expense/archive';
import { Section } from '@/components/layout/section';
import { api } from '@/trpc/server';

export default async function ArchivePage() {
  void api.expense.listArchive.prefetchInfinite({
    limit: 10,
  });
  void api.user.current.prefetch();

  return (
    <Section title="Archiwum">
      <Archive />
    </Section>
  );
}
