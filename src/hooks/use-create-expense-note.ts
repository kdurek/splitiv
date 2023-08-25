import { useRouter } from 'next/navigation';
import { api } from 'utils/api';

export function useCreateExpenseNote() {
  const router = useRouter();

  return api.expenseNote.create.useMutation({
    async onSuccess() {
      router.refresh();
    },
  });
}
