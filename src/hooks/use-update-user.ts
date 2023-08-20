import { useRouter } from 'next/navigation';
import { api } from 'utils/api';

export function useUpdateUser() {
  const router = useRouter();

  return api.user.update.useMutation({
    async onSuccess() {
      router.refresh();
    },
  });
}
