'use client';

import { Square, XSquare } from 'lucide-react';

import { ExpenseDebtSettleModal } from '@/components/expense/expense-debt-settle-modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExpensePayerCardProps {
  name: string | null;
  amount: number;
}

export function ExpensePayerCard({ name, amount }: ExpensePayerCardProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="overflow-hidden text-start">
          <div className="line-clamp-1 text-xs font-medium text-muted-foreground uppercase">Zapłacone przez</div>
          <div className="line-clamp-1">{name}</div>
        </div>
      </div>
      <div className="text-end">
        <div className="line-clamp-1 text-xs font-medium text-muted-foreground uppercase">Kwota</div>
        <div className="whitespace-nowrap">{amount.toFixed(2)} zł</div>
      </div>
    </div>
  );
}

interface ExpenseDebtorCardProps {
  debtId: string;
  name: string | null;
  amount: number;
  settled: number;
  canSettle: boolean;
}

export function ExpenseDebtorCard({ debtId, name, amount, settled, canSettle }: ExpenseDebtorCardProps) {
  const isFullySettled = settled === amount;
  const isPartiallySettled = settled !== amount && Number(settled) !== 0;

  const maximumAmount = Number(amount) - Number(settled);

  const statusIcon = isFullySettled ? (
    <XSquare className="size-9" strokeWidth={1} />
  ) : (
    <Square className="size-9" strokeWidth={1} />
  );

  return (
    <div className="flex items-center justify-between gap-4 overflow-hidden">
      <div className="flex items-center gap-4 overflow-hidden">
        <ExpenseDebtSettleModal debtId={debtId} amount={amount} settled={settled}>
          <Button
            variant="ghost"
            size="icon"
            className={cn('text-blue-500 hover:text-blue-500', {
              'text-teal-500 hover:text-teal-500': isFullySettled,
              'text-yellow-500 hover:text-yellow-500': isPartiallySettled,
            })}
            disabled={!canSettle}
          >
            {statusIcon}
          </Button>
        </ExpenseDebtSettleModal>
        <div className="text-start">
          <div className="line-clamp-1 text-xs font-medium text-muted-foreground uppercase">
            {isFullySettled ? 'Oddane' : 'Do oddania'}
          </div>
          <div className="line-clamp-1">{name}</div>
        </div>
      </div>
      <div className="text-end">
        <div className="line-clamp-1 text-xs font-medium text-muted-foreground uppercase">Kwota</div>
        <div className="whitespace-nowrap">
          {isFullySettled ? Number(amount).toFixed(2) : maximumAmount.toFixed(2)} zł
        </div>
      </div>
    </div>
  );
}
