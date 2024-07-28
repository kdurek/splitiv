'use client';

import { Undo2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';

interface DebtRevertButtonProps {
  logId: string;
}

export function DebtRevertButton({ logId }: DebtRevertButtonProps) {
  const { mutate: revert } = api.expense.log.revert.useMutation();

  const handleRevert = () => {
    revert(
      {
        logId,
      },
      {
        onSuccess() {
          toast.success('Pomyślnie cofnięto spłatę długu');
        },
        onError(err) {
          toast.error(err.message);
        },
      },
    );
  };

  return (
    <Button variant="outline" size="icon" onClick={handleRevert}>
      <Undo2 />
    </Button>
  );
}
